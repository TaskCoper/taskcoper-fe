import ProjectsSidebar from '@/components/sidebar/users/projects-sidebar'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { Spinner } from '@/components/ui/spinner'
import { Suspense } from 'react'
import { Outlet } from 'react-router'

export default function ProjectsLayout() {
  return (
    <SidebarProvider
      style={
        {
          '--sidebar-width': '48px'
        } as React.CSSProperties
      }
      className='w-full h-full'
    >
      <ProjectsSidebar />
      <SidebarInset className='flex flex-col h-full overflow-hidden'>
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
