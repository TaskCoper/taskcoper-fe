import AvatarWithTooltip from '@/components/avatar-with-tooltip'
import { customCollisionDetection } from '@/components/dnd/collision-detection'
import { useDndSensors } from '@/components/dnd/use-dnd-sensors'
import ProjectDetailSidebar from '@/components/sidebar/project-detail-sidebar'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { Skeleton } from '@/components/ui/skeleton'
import { Spinner } from '@/components/ui/spinner'
import { Tabs, TabsList } from '@/components/ui/tabs'
import AddParentMilestonePopover from '@/features/milestones/components/add-parent-milestone-popover'
import ParentMilestonesMenu from '@/features/milestones/components/parent-milestones-menu'
import { SortableMilestoneTab } from '@/features/milestones/components/sortable-milestone-tab'
import { useParentMilestoneDragDrop } from '@/features/milestones/hooks/use-parent-milestone-drag-drop'
import UpdateProjectMembersDialog from '@/features/projects/components/dialogs/update-project-members-dialog'
import { useGetParentMilestones } from '@/features/projects/hooks/use-get-parent-milestones'
import { useGetProjectMembers } from '@/features/projects/hooks/use-get-project-members'
import { useProjectRouting } from '@/features/projects/hooks/use-project-routing'
import { useIsMobile } from '@/hooks/use-mobile'
import { useAuthStore } from '@/lib/zustand/auth.store'
import { useMilestonePreferencesStore } from '@/lib/zustand/last-active-milestones.store'
import { cn } from '@/shared/utils'
import { DndContext, DragOverlay, MeasuringStrategy } from '@dnd-kit/core'
import { SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable'
import { MenuIcon, PlusIcon } from 'lucide-react'
import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Outlet, useLocation, useNavigate, useParams } from 'react-router'

const secondSidebarRoutes = ['milestones']

export default function ProjectDetailLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const { projectId } = useParams<{ projectId: string }>()

  const { user } = useAuthStore()
  const { removeLastActiveMilestone } = useMilestonePreferencesStore()

  const isMobile = useIsMobile()
  const sensors = useDndSensors()

  // get the current route for later checks
  const activeSegment = useMemo(() => {
    const parts = location.pathname.split('/')
    const projectIndex = parts.findIndex((p: string) => p === 'projects')
    if (projectIndex !== -1 && parts.length > projectIndex + 2) {
      return parts[projectIndex + 2]
    }
    return 'milestones'
  }, [location.pathname])

  // only show second sidebar on specific routes
  const hasSecondSidebar = secondSidebarRoutes.includes(activeSegment)

  // only fetch parent milestones when user is at /milestones
  const shouldFetchMilestones = activeSegment === 'milestones'
  const { parentMilestones, isLoadingParentMilestones } = useGetParentMilestones({
    projectId,
    enabled: shouldFetchMilestones
  })

  // show member avatars next to the parent milestones tab
  const { members, isLoadingMembers } = useGetProjectMembers({ projectId })
  // track which member avatar is being hovered for hover effects
  const [activeIndex, setActiveIndex] = useState<number | null>(null)

  // control the sidebar open state
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  // control the milestones dropdown menu open state
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  // ref to prevent the sidebar from auto-opening multiple times
  const hasAutoOpenedRef = useRef(false)

  // extract milestone items from the API response
  const items = useMemo(() => parentMilestones?.value.items || [], [parentMilestones])

  // extract just the IDs for drag-and-drop parent milestones
  const itemsId = useMemo(() => items.map((item) => item.id), [items])

  // check if the current user is the main/admin of this project
  const isCurrentUserMain =
    members?.value.items.find((member) => member.userId === user?.UserId && member.isMain) !== undefined

  const queryKey = ['parent-milestones', projectId]

  const { shouldDisplayTabs, activeTabValue, handleTabChange } = useProjectRouting({
    projectId,
    items,
    isLoading: isLoadingParentMilestones
  })

  // handles drag-and-drop logic for reordering milestone tabs
  const { activeMilestone, onDragStart, onDragOver, onDragEnd } = useParentMilestoneDragDrop({
    items,
    queryKey
  })

  // auto navigation when user delete parent milestone
  const createDeleteHandler = useCallback(
    (milestoneId: string) => () => {
      const currentIndex = items.findIndex((item) => item.id === milestoneId)
      if (currentIndex === -1) return

      // if this is the last remaining tab, navigate to project info page
      if (items.length === 1) {
        if (projectId) {
          removeLastActiveMilestone(projectId)
        }
        navigate(`/projects/${projectId}/info`)
        return
      }

      // navigate to previous tab, or next if deleting the first one
      const targetIndex = currentIndex > 0 ? currentIndex - 1 : 1
      const targetMilestone = items[targetIndex]

      if (targetMilestone) {
        handleTabChange(targetMilestone.id)
      }
    },
    [items, handleTabChange, projectId, removeLastActiveMilestone, navigate]
  )

  // callback received from ProjectDetailSidebar to notify us about task count
  const handleTaskCountChange = useCallback(
    (count: number, isLoading: boolean) => {
      // auto open sidebar when:
      // - we're on a route that has a second sidebar (e.g., milestones)
      // - tasks have finished loading
      // - there's at least one task
      // - we haven't already auto-opened before
      if (hasSecondSidebar && !isLoading && count > 0 && !hasAutoOpenedRef.current) {
        setTimeout(() => {
          setIsSidebarOpen(true)
          hasAutoOpenedRef.current = true
        }, 300)
      }
    },
    [hasSecondSidebar]
  )

  // reset the auto-open flag when switching routes
  useEffect(() => {
    hasAutoOpenedRef.current = false
  }, [activeSegment])

  return (
    <SidebarProvider
      open={isSidebarOpen}
      onOpenChange={setIsSidebarOpen}
      style={
        {
          '--sidebar-width': hasSecondSidebar ? '390px' : '48px',
          '--sidebar-width-icon': '48px'
        } as React.CSSProperties
      }
      className='w-full h-full'
    >
      <ProjectDetailSidebar onTaskCountChange={handleTaskCountChange} />

      <SidebarInset className='flex flex-col h-full overflow-hidden'>
        <header
          className={cn(
            'bg-muted/30 flex shrink-0 items-center gap-2',
            isMobile || hasSecondSidebar ? 'border-b p-4 h-14' : ''
          )}
        >
          {/* show sidebar toggle on mobile or when second sidebar exists */}
          {isMobile || hasSecondSidebar ? (
            <>
              <SidebarTrigger className='-ml-1' />
              <Separator orientation='vertical' className='data-[orientation=vertical]:h-4' />
            </>
          ) : null}

          {shouldDisplayTabs ? (
            <>
              {projectId ? (
                <div className='shrink-0'>
                  <AddParentMilestonePopover projectId={projectId}>
                    <Button variant='ghost' size='icon' className='size-7'>
                      <PlusIcon className='size-4' />
                    </Button>
                  </AddParentMilestonePopover>
                </div>
              ) : null}

              <ParentMilestonesMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen} items={items}>
                <Button
                  variant='ghost'
                  size='icon'
                  className={cn('size-7', isDropdownOpen ? 'bg-primary/10 text-primary' : '')}
                >
                  <MenuIcon className='size-4' />
                </Button>
              </ParentMilestonesMenu>

              {isLoadingParentMilestones ? (
                <Skeleton className='w-52 h-8' />
              ) : (
                <div className='flex-1 max-w-4/6 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]'>
                  <div className='flex items-center gap-2'>
                    <DndContext
                      collisionDetection={customCollisionDetection}
                      sensors={sensors}
                      onDragStart={onDragStart}
                      onDragEnd={onDragEnd}
                      onDragOver={onDragOver}
                      measuring={{ droppable: { strategy: MeasuringStrategy.Always } }}
                    >
                      {/* TODO: Add auto-scroll to active tab on mount */}
                      <Tabs value={activeTabValue} onValueChange={handleTabChange}>
                        <SortableContext items={itemsId} strategy={horizontalListSortingStrategy}>
                          <TabsList className='inline-flex h-9 items-center gap-2 text-muted-foreground w-full justify-start rounded-none bg-transparent p-0'>
                            {items.map((milestone) => (
                              <SortableMilestoneTab
                                key={milestone.id}
                                milestone={milestone}
                                isActive={activeTabValue === milestone.id}
                                queryKey={queryKey}
                                onDeleteSuccess={createDeleteHandler(milestone.id)}
                                canDelete={items.length > 1}
                              />
                            ))}
                          </TabsList>
                        </SortableContext>
                      </Tabs>

                      <DragOverlay>
                        {activeMilestone && (
                          <div className='w-52 border-2 border-primary bg-background px-2 py-1 shadow-lg rounded-md'>
                            <p className='truncate text-sm font-medium'>{activeMilestone.name}</p>
                          </div>
                        )}
                      </DragOverlay>
                    </DndContext>
                  </div>
                </div>
              )}

              {isLoadingMembers ? (
                <div className='flex items-center -space-x-2 *:ring-3 *:ring-background ml-auto'>
                  <Skeleton className='size-8 rounded-full' />
                  <Skeleton className='size-8 rounded-full' />
                  <Skeleton className='size-8 rounded-full' />
                  <Skeleton className='size-8 rounded-full' />
                </div>
              ) : projectId ? (
                <UpdateProjectMembersDialog projectId={projectId} isCurrentUserMain={isCurrentUserMain}>
                  <div
                    role='button'
                    className='flex items-center *:ring-2 *:ring-primary *:ring-offset-2 ml-auto cursor-pointer'
                  >
                    {members?.value.items.slice(0, 4).map((member, index) => (
                      <AvatarWithTooltip
                        key={member.userId}
                        avatar={member.avatar}
                        fullName={member.fullName}
                        email={member.email}
                        isActive={activeIndex === index}
                        onMouseEnter={() => setActiveIndex(index)}
                        onMouseLeave={() => setActiveIndex(null)}
                      />
                    ))}

                    {(members?.value.totalCount ?? 0) > 4 && (
                      <Avatar className='z-10 text-sm font-medium text-muted-foreground size-6'>
                        <AvatarFallback>
                          <p className='text-xs font-medium'>+{(members?.value.totalCount ?? 0) - 1}</p>
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                </UpdateProjectMembersDialog>
              ) : null}
            </>
          ) : null}
        </header>

        <Suspense
          fallback={
            <div className='flex h-full w-full items-center justify-center'>
              <Spinner className='text-muted-foreground' />
            </div>
          }
        >
          <div className='flex-1 overflow-auto'>
            <Outlet />
          </div>
        </Suspense>
      </SidebarInset>
    </SidebarProvider>
  )
}
