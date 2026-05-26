import { AdminSidebar } from '@/components/sidebar/admins/admin-sidebar'
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
import { Suspense } from 'react'
import { Outlet } from 'react-router'

interface AdminDefaultLayoutProps {
  basePath: '/dashboard' | '/manage'
}

export default function AdminDefaultLayout({ basePath }: AdminDefaultLayoutProps) {
  return (
    <SidebarProvider>
      <AdminSidebar basePath={basePath} />
      <SidebarInset className='flex flex-col h-full overflow-hidden'>
        <header className='flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12'>
          <div className='flex items-center gap-2 px-4'>
            <SidebarTrigger className='-ml-1' />
            <Separator orientation='vertical' className='mr-2 data-[orientation=vertical]:h-4' />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className='hidden md:block'>
                  <BreadcrumbLink href='#'>Building Your Application</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className='hidden md:block' />
                <BreadcrumbItem>
                  <BreadcrumbPage>Data Fetching</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
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
