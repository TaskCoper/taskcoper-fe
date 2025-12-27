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
import AddParentMilestonePopover from '@/features/milestones/components/add-parent-milestone-popover'
import ProjectSidebar from '@/features/projects/components/sidebar/project-sidebar'
import { useGetParentMilestones } from '@/features/projects/hooks/use-get-parent-milestones'
import { PlusIcon } from 'lucide-react'
import { Suspense, useEffect, useMemo } from 'react'
import { Outlet, useLocation, useNavigate, useParams } from 'react-router'

export default function ProjectDetailLayout() {
  const { projectId } = useParams<{ projectId: string }>()
  const navigate = useNavigate()
  const location = useLocation()

  const shouldDisplayTabs = location.pathname.includes('/milestones/')
  const currentMilestoneId = location.pathname.split('/milestones/')[1]?.split('/')[0]

  const { parentMilestones, isLoading } = useGetParentMilestones({ projectId })
  const items = useMemo(() => parentMilestones?.value.items || [], [parentMilestones])

  const handleTabChange = (milestoneId: string) => {
    navigate(`milestones/${milestoneId}`)
  }

  // if at root /projects/:id, go to first milestone
  useEffect(() => {
    const isProjectRoot =
      location.pathname === `/projects/${projectId}` || location.pathname === `/projects/${projectId}/`

    if (!isLoading && items.length > 0 && isProjectRoot) {
      navigate(`milestones/${items[0].id}`, { replace: true })
    }
  }, [isLoading, items, location.pathname, projectId, navigate])

  const activeTabValue = currentMilestoneId || items[0]?.id || ''

  return (
    <SidebarProvider
      style={
        {
          '--sidebar-width': '360px'
        } as React.CSSProperties
      }
      className='w-full h-full'
    >
      <ProjectSidebar />
      <SidebarInset className='flex flex-col h-full overflow-hidden'>
        <header className='bg-background flex shrink-0 items-center gap-2 border-b p-4 h-14'>
          <SidebarTrigger className='-ml-1' />
          <Separator orientation='vertical' className='mr-2 data-[orientation=vertical]:h-4' />

          {shouldDisplayTabs ? (
            <>
              {isLoading ? (
                <Skeleton className='w-52 h-8' />
              ) : (
                <div className='flex-1 min-w-0 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]'>
                  <div className='flex items-center gap-2'>
                    <Tabs value={activeTabValue} onValueChange={handleTabChange}>
                      <TabsList className='flex-nowrap'>
                        {items.map((milestone) => (
                          <TabsTrigger key={milestone.id} value={milestone.id} className='w-24'>
                            <p className='truncate'>{milestone.name}</p>
                          </TabsTrigger>
                        ))}
                      </TabsList>
                    </Tabs>
                  </div>
                </div>
              )}

              {projectId ? (
                <div className='shrink-0 ml-1'>
                  <AddParentMilestonePopover projectId={projectId}>
                    <Button variant='ghost' size='icon-sm'>
                      <PlusIcon className='size-4' />
                    </Button>
                  </AddParentMilestonePopover>
                </div>
              ) : null}
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
          <div className='flex-1 overflow-hidden'>
            <Outlet />
          </div>
        </Suspense>
      </SidebarInset>
    </SidebarProvider>
  )
}
