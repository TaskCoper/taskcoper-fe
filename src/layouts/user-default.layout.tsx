import SiteHeader from '@/components/site-header'
import { Spinner } from '@/components/ui/spinner'
import { Suspense } from 'react'
import { Outlet } from 'react-router'

export default function UserDefaultLayout() {
  return (
    <div className='flex h-screen w-full flex-col overflow-hidden'>
      <SiteHeader />
      <main className='flex-1 min-h-0 w-full relative overflow-hidden'>
        <Suspense
          fallback={
            <div className='flex h-full w-full items-center justify-center'>
              <Spinner className='text-muted-foreground' />
            </div>
          }
        >
          <Outlet />
        </Suspense>
      </main>
    </div>
  )
}
