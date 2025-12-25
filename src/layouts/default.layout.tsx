import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useGetMe } from '@/features/auth/hooks/use-get-me'
import NavUser from '@/features/projects/components/sidebar/nav-user'
import { BellIcon, MessageCircleIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link, Outlet } from 'react-router'
import logo from '/images/taskcoper.png'

const navigations = [
  {
    id: 100,
    label: 'header.home',
    url: '/'
  },
  {
    id: 200,
    label: 'header.featuredProjects',
    url: '/projects/featured'
  },
  {
    id: 300,
    label: 'header.expertNetwork',
    url: '/network'
  },
  {
    id: 400,
    label: 'header.startupCommunity',
    url: '/community'
  },
  {
    id: 500,
    label: 'header.news',
    url: '/news'
  }
]

export default function DefaultLayout() {
  const { t } = useTranslation()
  const { me, isGettingMe } = useGetMe()

  return (
    <div className='flex h-screen w-full flex-col overflow-hidden'>
      <header className='flex h-14 items-center gap-2 pr-4 border-b shrink-0 bg-background z-50 relative'>
        <Link to='/'>
          <img src={logo} alt='taskcoper' className='size-32 object-cover' />
        </Link>

        <div className='flex items-center gap-2'>
          {navigations.map((navigation) => (
            <Button key={navigation.id} asChild size='sm' variant='ghost'>
              <Link to={navigation.url}>{t(navigation.label)}</Link>
            </Button>
          ))}
        </div>

        <div className='flex-1' />

        <div className='flex items-center gap-3'>
          <div className='flex items-center gap-2'>
            <Button size='sm' asChild>
              <Link to='/projects'>{t('header.myProjects')}</Link>
            </Button>

            <Button size='icon-sm' variant='ghost'>
              <MessageCircleIcon />
            </Button>

            <Button size='icon-sm' variant='ghost'>
              <BellIcon />
            </Button>
          </div>

          {isGettingMe ? <Skeleton className='size-8 rounded-full' /> : <NavUser user={me} />}
        </div>
      </header>

      <main className='flex-1 h-full w-full relative'>
        <Outlet />
      </main>
    </div>
  )
}
