import SiteHeader from '@/components/site-header'
import { cn } from '@/shared/utils'
import { Outlet, useLocation } from 'react-router'

export default function PublicLayout() {
  const isHomePage = useLocation().pathname === '/'

  return (
    <div className={cn('min-h-screen flex flex-col', isHomePage ? 'home-public-layout' : 'h-dvh bg-dot')}>
      <SiteHeader fixed />
      <main className={cn('flex-1 min-h-0 flex flex-col', !isHomePage && 'pt-2')}>
        <Outlet />
      </main>
    </div>
  )
}
