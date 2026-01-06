import { customCollisionDetection } from '@/components/dnd/collision-detection'
import { useDndSensors } from '@/components/dnd/use-dnd-sensors'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { Skeleton } from '@/components/ui/skeleton'
import { Spinner } from '@/components/ui/spinner'
import { Tabs, TabsList } from '@/components/ui/tabs'
import AddParentMilestonePopover from '@/features/milestones/components/add-parent-milestone-popover'
import { SortableMilestoneTab } from '@/features/milestones/components/sortable-milestone-tab'
import { useParentMilestoneDragDrop } from '@/features/milestones/hooks/use-parent-milestone-drag-drop'
import ProjectDetailSidebar from '@/features/projects/components/sidebar/project-detail-sidebar'
import { useGetParentMilestones } from '@/features/projects/hooks/use-get-parent-milestones'
import { useProjectRouting } from '@/features/projects/hooks/use-project-routing'
import { useIsMobile } from '@/hooks/use-mobile'
import { DndContext, DragOverlay, MeasuringStrategy } from '@dnd-kit/core'
import { SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable'
import { FolderIcon, PlusIcon } from 'lucide-react'
import React, { Fragment, Suspense, useEffect, useMemo, useState } from 'react'
import { Outlet, useParams } from 'react-router'

const secondSidebarItems = ['milestones']

export default function ProjectDetailLayout() {
  const { projectId } = useParams<{ projectId: string }>()
  const isMobile = useIsMobile()
  const sensors = useDndSensors()

  const { parentMilestones, isLoading } = useGetParentMilestones({
    projectId,
    enabled: true
  })

  const items = useMemo(() => parentMilestones?.value.items || [], [parentMilestones])
  const itemsId = useMemo(() => items.map((item) => item.id), [items])

  const { activeSegment, shouldDisplayTabs, activeTabValue, handleTabChange } = useProjectRouting({
    projectId,
    items,
    isLoading
  })

  const hasSecondSidebar = secondSidebarItems.includes(activeSegment)
  const [isSidebarOpen, setIsSidebarOpen] = useState(hasSecondSidebar)

  const queryKey = ['parent-milestones', projectId]

  const { activeMilestone, onDragStart, onDragOver, onDragEnd } = useParentMilestoneDragDrop({
    items,
    queryKey
  })

  useEffect(() => {
    setIsSidebarOpen(hasSecondSidebar)
  }, [hasSecondSidebar])

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
      <ProjectDetailSidebar />
      <SidebarInset className='flex flex-col h-full overflow-hidden'>
        <header className='bg-muted/30 flex shrink-0 items-center gap-2 border-b p-4 h-14'>
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

              {isLoading ? (
                <Skeleton className='w-52 h-8' />
              ) : (
                <div className='flex-1 max-w-3/4 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]'>
                  <div className='flex items-center gap-2'>
                    <DndContext
                      collisionDetection={customCollisionDetection}
                      sensors={sensors}
                      onDragStart={onDragStart}
                      onDragEnd={onDragEnd}
                      onDragOver={onDragOver}
                      measuring={{ droppable: { strategy: MeasuringStrategy.Always } }}
                    >
                      <Tabs value={activeTabValue} onValueChange={handleTabChange}>
                        <SortableContext items={itemsId} strategy={horizontalListSortingStrategy}>
                          <TabsList className='flex-nowrap not-[]:justify-start rounded-none p-0 bg-transparent'>
                            {items.map((milestone, index) => (
                              <Fragment key={milestone.id}>
                                <SortableMilestoneTab
                                  key={milestone.id}
                                  milestone={milestone}
                                  isActive={activeTabValue === milestone.id}
                                  queryKey={queryKey}
                                />
                                {index < items.length - 1 ? (
                                  <Separator orientation='vertical' className='h-4!' />
                                ) : null}
                              </Fragment>
                            ))}
                          </TabsList>
                        </SortableContext>
                      </Tabs>

                      <DragOverlay>
                        {activeMilestone && (
                          <div className='w-52 flex items-center gap-2 border-2 border-primary bg-background px-2 py-1 shadow-lg rounded-md'>
                            <FolderIcon className='size-4' />
                            <p className='truncate font-medium'>{activeMilestone.name}</p>
                          </div>
                        )}
                      </DragOverlay>
                    </DndContext>
                  </div>
                </div>
              )}
            </>
          ) : (
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className='hidden md:block'>
                  <BreadcrumbLink href='#'>All Inboxes</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className='hidden md:block' />
                <BreadcrumbItem>
                  <BreadcrumbPage>Inbox</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          )}
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
