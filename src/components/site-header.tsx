import EnvironmentTag from '@/components/environment-tag'
import NavUser from '@/components/nav-user'
import '@/components/site-header.css'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Skeleton } from '@/components/ui/skeleton'
import { useGetMe } from '@/features/auth/hooks/use-get-me'
import NotificationsPopover from '@/features/notifications/components/notifications-popover'
import { useGetUnreadCount } from '@/features/notifications/hooks/use-get-unread-count'
import { useGetOrg } from '@/hooks/use-get-org'
import type { I18nKey } from '@/lib/i18n/types'
import { cn, getAvatarFallback } from '@/shared/utils'
import {
  BellIcon,
  BellRingIcon,
  HomeIcon,
  LayersIcon,
  MenuIcon,
  MessageCircleIcon,
  NewspaperIcon,
  RouteIcon
} from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useLocation } from 'react-router'
import logo from '/images/taskcoper.png'

type NavigationItem = { label: I18nKey; url: string; icon: typeof HomeIcon }

const accountNavigations: NavigationItem[] = [
  { label: 'header.home', url: '/', icon: HomeIcon },
  { label: 'header.news', url: '/news', icon: NewspaperIcon }
]

const guestNavigations: NavigationItem[] = [
  { label: 'home.landing.nav.features', url: '/#features', icon: LayersIcon },
  { label: 'home.landing.nav.workflow', url: '/#workflow', icon: RouteIcon },
  { label: 'header.news', url: '/news', icon: NewspaperIcon }
]

export default function SiteHeader({ fixed = false }: { fixed?: boolean }) {
  const { t } = useTranslation()
  const location = useLocation()
  const [openMenu, setOpenMenu] = useState(false)
  const [openNotifications, setOpenNotifications] = useState(false)
  const { me, isVerificationRequired, isGettingMe } = useGetMe()
  const { org } = useGetOrg({ orgId: me?.organizationId })
  const { unreadCount, isLoadingUnreadCount } = useGetUnreadCount({
    enabled: !!me && !isVerificationRequired
  })
  const navigations = me ? accountNavigations : guestNavigations
  const isActive = (url: string) => `${location.pathname}${location.hash}` === url

  return (
    <header className={cn('site-header', fixed && 'site-header-fixed')}>
      <div className='site-header-inner'>
        <div className='site-header-brand'>
          <Link to='/' className='site-header-logo'>
            <img src={logo} alt={t('common.alt.logo')} className='h-7 w-auto object-contain' />
          </Link>
          {org ? (
            <div className='site-header-organization'>
              <Separator orientation='vertical' className='h-5!' />
              <Avatar className='size-6 shrink-0'>
                <AvatarImage src={org.logo} />
                <AvatarFallback>{getAvatarFallback(org.name)}</AvatarFallback>
              </Avatar>
              <span className='truncate text-sm font-medium' title={org.name}>
                {org.name}
              </span>
            </div>
          ) : null}
        </div>

        <nav className='site-header-navigation' aria-label={t('common.ui.menu')}>
          {isGettingMe ? (
            <Skeleton className='h-8 w-44' />
          ) : (
            navigations.map((navigation) => (
              <Button
                key={navigation.url}
                asChild
                size='sm'
                variant='ghost'
                className={cn('site-header-link', isActive(navigation.url) && 'site-header-link-active')}
              >
                <Link to={navigation.url} aria-current={isActive(navigation.url) ? 'page' : undefined}>
                  {t(navigation.label)}
                </Link>
              </Button>
            ))
          )}
          <EnvironmentTag />
        </nav>

        <div className='site-header-actions'>
          {isGettingMe ? (
            <div className='flex items-center gap-3' aria-busy='true'>
              <Skeleton className='h-8 w-20' />
              <Skeleton className='size-8 rounded-full' />
            </div>
          ) : isVerificationRequired ? (
            <Button asChild size='sm' className='site-header-verify'>
              <Link to='/verify-email'>
                <BellRingIcon />
                <span className='truncate'>{t('header.verifyYourEmail')}</span>
              </Link>
            </Button>
          ) : me ? (
            <>
              <Button size='sm' asChild className='hidden lg:inline-flex'>
                <Link to='/projects'>{t('header.manageProjects')}</Link>
              </Button>
              <Button
                size='icon-sm'
                variant='ghost'
                className='hidden sm:inline-flex'
                aria-label={t('notification.type.chat')}
              >
                <MessageCircleIcon className='size-4' />
              </Button>
              <NotificationsPopover open={openNotifications} onOpenChange={setOpenNotifications}>
                <Button
                  size='icon-sm'
                  variant='ghost'
                  aria-label={t('notification.popover.title')}
                  className={cn('relative', openNotifications && 'bg-primary/10 text-primary')}
                >
                  <BellIcon className='size-4' />
                  {!isLoadingUnreadCount && unreadCount > 0 ? (
                    <span className='absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] text-white'>
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  ) : null}
                </Button>
              </NotificationsPopover>
              <NavUser user={me} />
            </>
          ) : (
            <>
              <Button asChild variant='ghost' size='sm' className='site-header-guest-action'>
                <Link to='/sign-in'>{t('home.header.signIn')}</Link>
              </Button>
              <Button asChild size='sm' className='site-header-guest-action'>
                <Link to='/sign-up'>{t('home.header.getStarted')}</Link>
              </Button>
            </>
          )}

          <Sheet open={openMenu} onOpenChange={setOpenMenu}>
            <SheetTrigger asChild>
              <Button variant='ghost' size='icon-sm' className='lg:hidden' aria-label={t('common.button.toggleMenu')}>
                <MenuIcon className='size-5' />
              </Button>
            </SheetTrigger>
            <SheetContent side='right' className='gap-0' aria-describedby={undefined}>
              <SheetHeader>
                <SheetTitle className='text-left'>{t('common.ui.menu')}</SheetTitle>
              </SheetHeader>
              <nav className='flex flex-col gap-2 px-2' aria-label={t('common.ui.menu')}>
                {navigations.map(({ icon: Icon, ...navigation }) => (
                  <Button
                    key={navigation.url}
                    asChild
                    variant='ghost'
                    onClick={() => setOpenMenu(false)}
                    className={cn('justify-start', isActive(navigation.url) && 'bg-primary/10 text-primary')}
                  >
                    <Link to={navigation.url} aria-current={isActive(navigation.url) ? 'page' : undefined}>
                      <Icon className='size-4' />
                      {t(navigation.label)}
                    </Link>
                  </Button>
                ))}
                <div className='px-3 py-2'>
                  <EnvironmentTag />
                </div>
                {me && !isVerificationRequired ? (
                  <>
                    <Separator className='my-2' />
                    <Button asChild onClick={() => setOpenMenu(false)}>
                      <Link to='/projects'>{t('header.manageProjects')}</Link>
                    </Button>
                  </>
                ) : null}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
