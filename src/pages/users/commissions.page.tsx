import NavUser from '@/components/nav-user'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Skeleton } from '@/components/ui/skeleton'
import { useGetMe } from '@/features/auth/hooks/use-get-me'
import { useGetPublicCommissions } from '@/features/commissions/hooks/use-get-public-commissions'
import type { Commission } from '@/features/commissions/types'
import NotificationsPopover from '@/features/notifications/components/notifications-popover'
import { useGetUnreadCount } from '@/features/notifications/hooks/use-get-unread-count'
import { useGetOrg } from '@/hooks/use-get-org'
import { useAuthStore } from '@/lib/zustand/auth.store'
import { cn, formatCurrency, getAvatarFallback } from '@/shared/utils'
import {
  BellIcon,
  CircleCheckBigIcon,
  FolderClosedIcon,
  GlobeIcon,
  HomeIcon,
  MenuIcon,
  MessageCircleIcon,
  NewspaperIcon,
  UsersRoundIcon
} from 'lucide-react'
import { createElement, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useLocation } from 'react-router'
import logo from '/images/taskcoper.png'

const navigations = [
  { id: 100, label: 'header.home', icon: HomeIcon, url: '/' },
  { id: 200, label: 'header.featuredProjects', icon: FolderClosedIcon, url: '/featured-projects' },
  { id: 300, label: 'header.expertNetwork', icon: UsersRoundIcon, url: '/network' },
  { id: 400, label: 'header.startupCommunity', icon: GlobeIcon, url: '/community' },
  { id: 500, label: 'header.news', icon: NewspaperIcon, url: '/news' }
]

export default function CommissionsPage() {
  const { t } = useTranslation()
  const location = useLocation()
  const [open, setOpen] = useState(false)
  const [openNotificationsPopover, setOpenNotificationsPopover] = useState(false)

  const { me, isGettingMe } = useGetMe()
  const { user } = useAuthStore()
  const { org } = useGetOrg({ orgId: user?.OrganizationId })
  const { unreadCount, isLoadingUnreadCount } = useGetUnreadCount({ enabled: !!me })

  const { publicCommissions, isLoadingPublicCommissions } = useGetPublicCommissions()

  const getRankDetail = (titleLevel: string) => {
    const validRanks = ['Bronze', 'Silver', 'Gold', 'Platinum']
    const rankKey = validRanks.includes(titleLevel) ? titleLevel : 'default'
    return {
      description: t(`commissionPage.ranks.${rankKey}.description`),
      subprice: t('commissionPage.revenueShare'),
      cta: t(`commissionPage.ranks.${rankKey}.cta`, { rank: titleLevel }),
      featuresTitle: t('commissionPage.featuresTitle')
    }
  }

  const getRateRange = (commissions: Commission[]) => {
    if (!commissions || commissions.length === 0) return '0%'
    const rates = commissions.map((c) => c.rate)
    const min = Math.min(...rates) * 100
    const max = Math.max(...rates) * 100
    if (min === max) return `${min.toFixed(0)}%`
    return `${min.toFixed(0)}% - ${max.toFixed(0)}%`
  }

  return (
    <div className='min-h-screen flex flex-col bg-dot'>
      <div className='fixed top-0 left-0 right-0 z-50 bg-linear-to-b from-background to-background/70'>
        <div className='px-4 h-14 flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <Link to='/' className='shrink-0'>
              <img src={logo} alt='TaskCoper' className='h-7' />
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
          </div>

          {isGettingMe ? (
            <div className='hidden md:flex items-center gap-2'>
              <Skeleton className='w-20 h-8 rounded-md' />
              <Skeleton className='size-8 rounded-full' />
            </div>
          ) : me ? (
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

              <NavUser user={me} />

              <Sheet open={open} onOpenChange={setOpen}>
                <SheetTrigger asChild>
                  <Button variant='ghost' size='icon' className='lg:hidden -mr-2'>
                    <MenuIcon className='size-5' />
                    <span className='sr-only'>Toggle menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side='right' className='gap-0'>
                  <SheetHeader>
                    <SheetTitle className='text-left'>Menu</SheetTitle>
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
      </div>

      <main className='flex-1 pt-14'>
        <div className='px-4 py-4 relative'>
          <div className='flex flex-col justify-center items-center gap-4 my-16 max-w-7xl mx-auto text-center'>
            <p className='text-5xl sm:text-6xl font-extrabold'>{t('commissionPage.title')}</p>
            <p className='text-muted-foreground max-w-2xl'>{t('commissionPage.subtitle')}</p>
          </div>

          <div className='relative grid grid-cols-12 gap-4 max-w-7xl mx-auto'>
            {isLoadingPublicCommissions
              ? Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className='col-span-12 sm:col-span-6 lg:col-span-3'>
                    <Skeleton className='h-96 w-full rounded-xl' />
                  </div>
                ))
              : publicCommissions.value.items.map((rank) => {
                  const details = getRankDetail(rank.titleLevel)
                  const priceRange = getRateRange(rank.commissions)

                  return (
                    <Card
                      key={rank.titleLevel}
                      className={cn('col-span-12 sm:col-span-6 lg:col-span-3 rounded-xl p-1 gap-0')}
                    >
                      <Card
                        className={cn(
                          'rounded-lg p-3 gap-0',
                          'bg-background/30 backdrop-blur-md border border-border/30'
                        )}
                      >
                        <div className='space-y-3'>
                          <p className='text-lg font-semibold'>{rank.titleLevel}</p>

                          <div className='space-y-1'>
                            <p className='text-3xl font-bold tracking-tight'>{priceRange}</p>
                            <p className='text-xs text-muted-foreground'>{details.subprice}</p>
                          </div>

                          <p className='text-sm text-foreground/80 leading-relaxed'>{details.description}</p>

                          <Link to='/applications/submit'>
                            <Button className='w-full' size='sm'>
                              {details.cta}
                            </Button>
                          </Link>
                        </div>
                      </Card>

                      <div className='space-y-3 p-4'>
                        <p className='text-sm font-medium'>{details.featuresTitle}</p>

                        <div className='space-y-2'>
                          {rank.commissions.map((c) => (
                            <div key={c.commissionId} className='flex items-start gap-2'>
                              <CircleCheckBigIcon className='size-3 shrink-0 mt-0.5 text-foreground/80' />
                              <div className='text-xs text-foreground/80 leading-relaxed'>
                                <p>
                                  {c.minAmount === 0
                                    ? t('commissionPage.upTo')
                                    : `${formatCurrency(c.minAmount, 'Vnd')} - `}
                                  {c.maxAmount ? formatCurrency(c.maxAmount, 'Vnd') : t('commissionPage.unlimited')}
                                </p>
                                <p className='font-semibold text-primary mt-0.5'>
                                  {t('commissionPage.earn')}
                                  {(c.rate * 100).toFixed(0)}%
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </Card>
                  )
                })}
          </div>
        </div>
      </main>
    </div>
  )
}
