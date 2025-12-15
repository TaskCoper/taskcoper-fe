import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb'
import { Separator } from '@/components/ui/separator'
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { Spinner } from '@/components/ui/spinner'
import ProjectSidebar from '@/features/projects/components/sidebar/project-sidebar'
import { Suspense } from 'react'
import { Outlet } from 'react-router'

export default function ProjectLayout() {
  return (
    <SidebarProvider
      style={
        {
          '--sidebar-width': '360px'
        } as React.CSSProperties
      }
    >
      <ProjectSidebar />
      <SidebarInset className='flex flex-col h-screen overflow-hidden'>
        <header className='bg-background flex shrink-0 items-center gap-2 border-b p-4'>
          <SidebarTrigger className='-ml-1' />
          <Separator orientation='vertical' className='mr-2 data-[orientation=vertical]:h-4' />
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
        </header>

        {/* TODO: replace this with page specific skeleton */}
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
