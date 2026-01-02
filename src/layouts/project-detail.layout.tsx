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
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import AddParentMilestonePopover from '@/features/milestones/components/add-parent-milestone-popover'
import ProjectDetailSidebar from '@/features/projects/components/sidebar/project-detail-sidebar'
import { useGetParentMilestones } from '@/features/projects/hooks/use-get-parent-milestones'
import { useIsMobile } from '@/hooks/use-mobile'
import { cn } from '@/shared/utils'
import { PlusIcon } from 'lucide-react'
import { Suspense, useEffect, useMemo, useState } from 'react'
import { Outlet, useLocation, useNavigate, useParams } from 'react-router'

const secondSidebarItems = ['milestones']

export default function ProjectDetailLayout() {
  const { projectId } = useParams<{ projectId: string }>()
  const isMobile = useIsMobile()
  const navigate = useNavigate()
  const location = useLocation()

  const activeSegment = useMemo(() => {
    const parts = location.pathname.split('/')
    const projectIndex = parts.findIndex((p) => p === 'projects')
    if (projectIndex !== -1 && parts.length > projectIndex + 2) {
      return parts[projectIndex + 2]
    }
    return 'milestones'
  }, [location.pathname])

  const hasSecondSidebar = secondSidebarItems.includes(activeSegment)
  const [isSidebarOpen, setIsSidebarOpen] = useState(hasSecondSidebar)

  useEffect(() => {
    setIsSidebarOpen(hasSecondSidebar)
  }, [hasSecondSidebar])

  const isProjectRoot =
    location.pathname === `/projects/${projectId}` || location.pathname === `/projects/${projectId}/`

  const isMilestonesRoot = location.pathname.endsWith('/milestones') || location.pathname.endsWith('/milestones/')

  const { parentMilestones, isLoading } = useGetParentMilestones({
    projectId,
    enabled: isProjectRoot || isMilestonesRoot
  })

  const items = useMemo(() => parentMilestones?.value.items || [], [parentMilestones])

  useEffect(() => {
    if (!isLoading && items.length > 0 && (isProjectRoot || isMilestonesRoot)) {
      navigate(`milestones/${items[0].id}`, { replace: true })
    }
  }, [isLoading, items, isProjectRoot, isMilestonesRoot, navigate])

  const shouldDisplayTabs = activeSegment === 'milestones'
  const currentMilestoneId = shouldDisplayTabs ? location.pathname.split('/milestones/')[1]?.split('/')[0] : ''
  const activeTabValue = currentMilestoneId || items[0]?.id || ''

  const handleTabChange = (milestoneId: string) => {
    navigate(`milestones/${milestoneId}`)
  }

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
        <header className='bg-background flex shrink-0 items-center gap-2 border-b p-4 h-14'>
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
                <div className='flex-1 max-w-xl overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]'>
                  <div className='flex items-center gap-2'>
                    <Tabs value={activeTabValue} onValueChange={handleTabChange}>
                      <TabsList className='flex-nowrap not-[]:justify-start rounded-none p-0 bg-transparent'>
                        {items.map((milestone) => (
                          <TabsTrigger
                            key={milestone.id}
                            value={milestone.id}
                            className={cn(
                              'relative rounded-none border-b-2 border-b-transparent bg-transparent px-4 pb-3 pt-2 font-medium text-muted-foreground shadow-none transition-none focus-visible:ring-0 data-[state=active]:border-b-primary data-[state=active]:text-foreground data-[state=active]:shadow-none data-[state=active]:bg-transparent data-[state=active]:font-semibold',
                              activeTabValue === milestone.id ? 'w-auto' : 'w-24'
                            )}
                          >
                            <Tooltip>
                              <TooltipTrigger asChild className='w-full cursor-pointer'>
                                <p className='truncate'>{milestone.name}</p>
                              </TooltipTrigger>
                              <TooltipContent side='bottom'>
                                <p>{milestone.name}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TabsTrigger>
                        ))}
                      </TabsList>
                    </Tabs>
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
