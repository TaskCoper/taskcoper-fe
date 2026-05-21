import NavUser from '@/components/nav-user'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Skeleton } from '@/components/ui/skeleton'
import { Spinner } from '@/components/ui/spinner'
import { useGetMe } from '@/features/auth/hooks/use-get-me'
import NotificationsPopover from '@/features/notifications/components/notifications-popover'
import { useGetUnreadCount } from '@/features/notifications/hooks/use-get-unread-count'
import { useGetOrg } from '@/hooks/use-get-org'
import { cn, getAvatarFallback } from '@/shared/utils'
import { BellIcon, HomeIcon, MenuIcon, MessageCircleIcon, NewspaperIcon, UsersRoundIcon } from 'lucide-react'
import { createElement, Suspense, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, Outlet, useLocation } from 'react-router'
import logo from '/images/taskcoper.png'

const navigations = [
  {
    id: 100,
    label: 'header.home',
    icon: HomeIcon,
    url: '/'
  },
  // {
  //   id: 200,
  //   label: 'header.featuredProjects',
  //   icon: FolderClosedIcon,
  //   url: '/featured-projects'
  // },
  {
    id: 300,
    label: 'header.expertNetwork',
    icon: UsersRoundIcon,
    url: '/network'
  },
  // {
  //   id: 400,
  //   label: 'header.startupCommunity',
  //   icon: GlobeIcon,
  //   url: '/community'
  // },
  {
    id: 500,
    label: 'header.news',
    icon: NewspaperIcon,
    url: '/news'
  }
]

export default function UserDefaultLayout() {
  const { t } = useTranslation()
  const location = useLocation()
  const [open, setOpen] = useState(false)
  const [openNotificationsPopover, setOpenNotificationsPopover] = useState(false)

  const { me, isVerificationRequired, isGettingMe } = useGetMe()
  const { org } = useGetOrg({ orgId: me?.organizationId })
  const { unreadCount, isLoadingUnreadCount } = useGetUnreadCount({
    enabled: !!me && openNotificationsPopover && !isVerificationRequired
  })

  return (
    <div className='flex h-screen w-full flex-col overflow-hidden'>
      <header className='flex h-14 items-center gap-3 px-4 border-b shrink-0 bg-background z-50 relative'>
        <Link to='/' className='shrink-0'>
          <img src={logo} alt={t('common.alt.logo')} className='h-7 w-auto object-contain' />
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
          {navigations.map((navigation) => {
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
        </div>

        <div className='flex-1' />

        <div className='flex items-center gap-2 sm:gap-4'>
          <div className='flex items-center gap-1 sm:gap-3'>
            <Button size='sm' asChild className='hidden lg:flex'>
              <Link to='/projects'>{t('header.manageProjects')}</Link>
            </Button>

            <Button size='icon-sm' variant='ghost' className='relative'>
              <MessageCircleIcon className='size-4 sm:size-5' />
            </Button>

            <NotificationsPopover open={openNotificationsPopover} onOpenChange={setOpenNotificationsPopover}>
              <Button
                size='icon-sm'
                variant='ghost'
                className={cn('relative', openNotificationsPopover ? 'bg-primary/10 text-primary' : '')}
              >
                <BellIcon className='size-4 sm:size-5' />
                {isLoadingUnreadCount ? null : unreadCount > 0 ? (
                  <div className='absolute p-1 rounded-full bg-destructive size-4 flex justify-center items-center top-0 right-0'>
                    <p className='text-xs text-white'>{unreadCount}</p>
                  </div>
                ) : null}
              </Button>
            </NotificationsPopover>
          </div>

          {isGettingMe ? <Skeleton className='size-8 rounded-full' /> : <NavUser user={me} />}

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
                  {navigations.map((navigation) => {
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

                <Separator />

                <div className='px-2'>
                  <Button asChild onClick={() => setOpen(false)} className='w-full'>
                    <Link to='/projects'>{t('header.manageProjects')}</Link>
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </header>

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
