import EnvironmentTag from '@/components/environment-tag'
import NavUser from '@/components/nav-user'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Skeleton } from '@/components/ui/skeleton'
import { useGetMe } from '@/features/auth/hooks/use-get-me'
import NotificationsPopover from '@/features/notifications/components/notifications-popover'
import { useGetUnreadCount } from '@/features/notifications/hooks/use-get-unread-count'
import { useGetOrg } from '@/hooks/use-get-org'
import { resolveFeatureCheck, useFilteredNavItems, useTenantConfig, type GuardedNavItem } from '@/lib/feature-flags'
import type { I18nKey } from '@/lib/i18n/types'
import { cn, getAvatarFallback } from '@/shared/utils'
import {
  BellIcon,
  BellRingIcon,
  HomeIcon,
  MenuIcon,
  MessageCircleIcon,
  NewspaperIcon,
  UsersRoundIcon
} from 'lucide-react'
import { createElement, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, Outlet, useLocation } from 'react-router'
import logo from '/images/taskcoper.png'

type PublicNavItem = GuardedNavItem & { id: number; label: I18nKey; icon: typeof HomeIcon; url: string }

const navigations: PublicNavItem[] = [
  { id: 100, label: 'header.home', icon: HomeIcon, url: '/', feature: 'module.home' },
  // { id: 200, label: 'header.featuredProjects', icon: FolderClosedIcon, url: '/featured-projects' },
  { id: 300, label: 'header.expertNetwork', icon: UsersRoundIcon, url: '/network', feature: 'module.mentorNetworking' },
  // { id: 400, label: 'header.startupCommunity', icon: GlobeIcon, url: '/community' },
  { id: 500, label: 'header.news', icon: NewspaperIcon, url: '/news', feature: 'module.news' }
]

export default function PublicLayout() {
  const { t } = useTranslation()
  const location = useLocation()
  const [open, setOpen] = useState(false)
  const [openNotificationsPopover, setOpenNotificationsPopover] = useState(false)

  const { me, isVerificationRequired, isGettingMe } = useGetMe()
  const { org } = useGetOrg({ orgId: me?.organizationId })
  const tenantConfig = useTenantConfig()
  const visibleNavigations = useFilteredNavItems(navigations)
  const isTaskManagementEnabled = resolveFeatureCheck(tenantConfig, 'module.taskManagement')

  const { unreadCount, isLoadingUnreadCount } = useGetUnreadCount({
    enabled: !!me && !isVerificationRequired
  })

  return (
    <div className='h-dvh min-h-screen flex flex-col bg-dot'>
      <header className='fixed top-0 left-0 right-0 z-50 bg-linear-to-b from-background to-background/70'>
        <div className='px-4 h-14 flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <Link to={tenantConfig.logoUrl} className='shrink-0'>
              <img src={logo} alt={t('common.alt.logo')} className='h-7' />
            </Link>

            {org ? (
              <div className='flex items-center gap-4 mr-4'>
                <Separator orientation='vertical' className='h-5! bg-foreground/30' />
                <div className='flex items-center gap-2'>
                  <Avatar className='size-6'>
                    <AvatarImage src={org.logo} />
                    <AvatarFallback>{getAvatarFallback(org.name)}</AvatarFallback>
                  </Avatar>

                  <p className='text-sm font-medium'>{org.name}</p>
                </div>
              </div>
            ) : null}

            <div className='hidden lg:flex items-center gap-2'>
              {visibleNavigations.map((navigation) => {
                const isActive = location.pathname === navigation.url

                return (
                  <Button
                    key={navigation.id}
                    asChild
                    size='sm'
                    variant='ghost'
                    className={cn(isActive && 'bg-primary/10 text-primary')}
                  >
                    <Link to={navigation.url}>{t(navigation.label)}</Link>
                  </Button>
                )
              })}

              <EnvironmentTag />
            </div>
          </div>

          {isGettingMe ? (
            <div className='hidden md:flex items-center gap-2'>
              <Skeleton className='w-20 h-8 rounded-md' />
              <Skeleton className='size-8 rounded-full' />
            </div>
          ) : isVerificationRequired ? (
            <Link to='/verify-email'>
              <Button size='sm' className='verify-email-cta'>
                <BellRingIcon />
                {t('header.verifyYourEmail')}
              </Button>
            </Link>
          ) : me ? (
            <div className='flex items-center gap-2 sm:gap-4'>
              <div className='flex items-center gap-1 sm:gap-3'>
                {isTaskManagementEnabled ? (
                  <Button size='sm' asChild className='hidden lg:flex'>
                    <Link to='/projects'>{t('header.manageProjects')}</Link>
                  </Button>
                ) : null}

                <Button size='icon-sm' variant='ghost' className='relative'>
                  <MessageCircleIcon className='size-4 sm:size-5' />
                </Button>

                <NotificationsPopover open={openNotificationsPopover} onOpenChange={setOpenNotificationsPopover}>
                  <Button size='icon-sm' variant={openNotificationsPopover ? 'default' : 'ghost'} className='relative'>
                    <BellIcon className='size-4 sm:size-5' />
                    {isLoadingUnreadCount ? null : unreadCount > 0 ? (
                      <div className='absolute p-1 rounded-full bg-destructive size-4 flex justify-center items-center top-0 right-0'>
                        <p className='text-xs text-white'>{unreadCount}</p>
                      </div>
                    ) : null}
                  </Button>
                </NotificationsPopover>
              </div>

              <NavUser user={me} />

              <Sheet open={open} onOpenChange={setOpen}>
                <SheetTrigger asChild>
                  <Button variant='ghost' size='icon' className='lg:hidden -mr-2'>
                    <MenuIcon className='size-5' />
                    <span className='sr-only'>{t('common.button.toggleMenu')}</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side='right' className='gap-0'>
                  <SheetHeader>
                    <SheetTitle className='text-left'>{t('common.ui.menu')}</SheetTitle>
                  </SheetHeader>

                  <div className='flex flex-col gap-4'>
                    <div className='flex flex-col gap-2 px-2'>
                      {visibleNavigations.map((navigation) => {
                        const isActive = location.pathname === navigation.url
                        return (
                          <Button
                            key={navigation.id}
                            asChild
                            variant='ghost'
                            className={cn('justify-start px-2', isActive && 'bg-primary/10 text-primary')}
                            onClick={() => setOpen(false)}
                          >
                            <Link to={navigation.url} className='flex items-center gap-3'>
                              {createElement(navigation.icon, { className: 'size-4' })}
                              {t(navigation.label)}
                            </Link>
                          </Button>
                        )
                      })}
                    </div>

                    {isTaskManagementEnabled ? (
                      <>
                        <Separator />

                        <div className='px-2'>
                          <Button asChild onClick={() => setOpen(false)} className='w-full'>
                            <Link to='/projects'>{t('header.manageProjects')}</Link>
                          </Button>
                        </div>
                      </>
                    ) : null}
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          ) : (
            <div className='flex items-center gap-2 sm:gap-3'>
              <Link to='/sign-in'>
                <Button variant='ghost' size='sm' className='text-slate-700 text-xs sm:text-sm'>
                  {t('home.header.signIn')}
                </Button>
              </Link>
              <Link to='/sign-up'>
                <Button size='sm' className='shadow-lg shadow-primary/20 text-xs sm:text-sm'>
                  {t('home.header.getStarted')}
                </Button>
              </Link>
            </div>
          )}
        </div>
      </header>

      <main className='flex-1 min-h-0 flex flex-col'>
        <Outlet />
      </main>
    </div>
  )
}
