import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Skeleton } from '@/components/ui/skeleton'
import { useGetMe } from '@/features/auth/hooks/use-get-me'
import NavUser from '@/features/projects/components/sidebar/nav-user'
import {
  BellIcon,
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
import { Link, Outlet } from 'react-router'
import logo from '/images/taskcoper.png'

const navigations = [
  {
    id: 100,
    label: 'header.home',
    icon: HomeIcon,
    url: '/'
  },
  {
    id: 200,
    label: 'header.featuredProjects',
    icon: FolderClosedIcon,
    url: '/featured-projects'
  },
  {
    id: 300,
    label: 'header.expertNetwork',
    icon: UsersRoundIcon,
    url: '/network'
  },
  {
    id: 400,
    label: 'header.startupCommunity',
    icon: GlobeIcon,
    url: '/community'
  },
  {
    id: 500,
    label: 'header.news',
    icon: NewspaperIcon,
    url: '/news'
  }
]

export default function DefaultLayout() {
  const { t } = useTranslation()
  const { me, isGettingMe } = useGetMe()
  const [open, setOpen] = useState(false)

  return (
    <div className='flex h-screen w-full flex-col overflow-hidden'>
      <header className='flex h-14 items-center gap-2 px-4 border-b shrink-0 bg-background z-50 relative'>
        <Link to='/' className='shrink-0'>
          <img src={logo} alt='TaskCoper' className='h-14 w-auto object-contain' />
        </Link>

        <div className='hidden md:flex items-center gap-2'>
          {navigations.map((navigation) => (
            <Button key={navigation.id} asChild size='sm' variant='ghost'>
              <Link to={navigation.url}>{t(navigation.label)}</Link>
            </Button>
          ))}
        </div>

        <div className='flex-1' />

        <div className='flex items-center gap-2 sm:gap-3'>
          <div className='flex items-center gap-1 sm:gap-2'>
            <Button size='sm' asChild className='hidden md:flex'>
              <Link to='/projects'>{t('header.manageProjects')}</Link>
            </Button>

            <Button size='icon-sm' variant='ghost'>
              <MessageCircleIcon className='size-4 sm:size-5' />
            </Button>

            <Button size='icon-sm' variant='ghost'>
              <BellIcon className='size-4 sm:size-5' />
            </Button>
          </div>

          {isGettingMe ? <Skeleton className='size-8 rounded-full' /> : <NavUser user={me} />}

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant='ghost' size='icon' className='md:hidden -mr-2'>
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
                  {navigations.map((navigation) => (
                    <Button
                      key={navigation.id}
                      asChild
                      variant='ghost'
                      className='justify-start px-2'
                      onClick={() => setOpen(false)}
                    >
                      <Link to={navigation.url} className='flex items-center gap-3'>
                        {createElement(navigation.icon, { className: 'size-4' })}
                        {t(navigation.label)}
                      </Link>
                    </Button>
                  ))}
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

      <main className='flex-1 h-full w-full relative'>
        <Outlet />
      </main>
    </div>
  )
}
