import { NavQuickActions } from '@/components/sidebar/users/nav-quick-actions'
import { Sidebar, SidebarContent, SidebarRail, SidebarTrigger } from '@/components/ui/sidebar'
import { useGetMe } from '@/features/auth/hooks/use-get-me'
import type { Role } from '@/features/users/types'
import { cn } from '@/shared/utils'
import {
  AudioWaveform,
  BookOpen,
  Bot,
  CalendarDaysIcon,
  Command,
  FileClockIcon,
  FolderOpenIcon,
  GalleryVerticalEnd,
  HistoryIcon,
  Settings2,
  ShoppingBagIcon,
  SquareTerminal,
  TicketPercentIcon,
  VideoIcon,
  type LucideIcon
} from 'lucide-react'
import * as React from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation } from 'react-router'

type NavItem = {
  titleKey: string
  url: string
  icon: LucideIcon
}

type NavItemConfig = NavItem & {
  roles?: Role[]
}

const NAV_CONFIG: NavItemConfig[] = [
  {
    titleKey: 'project.sidebar.myProjects',
    url: '/projects',
    icon: FolderOpenIcon
  },
  {
    titleKey: 'project.sidebar.myCalendar',
    url: '/calendar',
    icon: CalendarDaysIcon
  },
  {
    titleKey: 'purchaseHistory.title',
    url: '/purchases',
    icon: ShoppingBagIcon
  },
  {
    titleKey: 'mentorPackage.sidebar.meetingSessionPackages',
    url: '/packages',
    icon: VideoIcon,
    roles: ['Mentor']
  },
  {
    titleKey: 'voucher.sidebar.vouchers',
    url: '/vouchers',
    icon: TicketPercentIcon,
    roles: ['Mentor']
  },
  {
    titleKey: 'pageTitle.transactions',
    url: '/transactions',
    icon: HistoryIcon
  },
  {
    titleKey: 'project.sidebar.applicationHistory',
    url: '/applications',
    icon: FileClockIcon,
    roles: ['User']
  }
]

export function UserWorkspaceSidebar({ className, ...props }: React.ComponentProps<typeof Sidebar>) {
  const location = useLocation()
  const { me: user } = useGetMe()
  const { t } = useTranslation()

  const data = React.useMemo(() => {
    return {
      user: {
        name: 'shadcn',
        email: 'm@example.com',
        avatar: '/avatars/shadcn.jpg'
      },
      teams: [
        {
          name: 'Acme Inc',
          logo: GalleryVerticalEnd,
          plan: 'Enterprise'
        },
        {
          name: 'Acme Corp.',
          logo: AudioWaveform,
          plan: 'Startup'
        },
        {
          name: 'Evil Corp.',
          logo: Command,
          plan: 'Free'
        }
      ],
      navMain: [
        {
          title: 'Playground',
          url: '#',
          icon: SquareTerminal,
          isActive: true,
          items: [
            {
              title: 'History',
              url: '#'
            },
            {
              title: 'Starred',
              url: '#'
            },
            {
              title: 'Settings',
              url: '#'
            }
          ]
        },
        {
          title: 'Models',
          url: '#',
          icon: Bot,
          items: [
            {
              title: 'Genesis',
              url: '#'
            },
            {
              title: 'Explorer',
              url: '#'
            },
            {
              title: 'Quantum',
              url: '#'
            }
          ]
        },
        {
          title: 'Documentation',
          url: '#',
          icon: BookOpen,
          items: [
            {
              title: 'Introduction',
              url: '#'
            },
            {
              title: 'Get Started',
              url: '#'
            },
            {
              title: 'Tutorials',
              url: '#'
            },
            {
              title: 'Changelog',
              url: '#'
            }
          ]
        },
        {
          title: 'Settings',
          url: '#',
          icon: Settings2,
          items: [
            {
              title: 'General',
              url: '#'
            },
            {
              title: 'Team',
              url: '#'
            },
            {
              title: 'Billing',
              url: '#'
            },
            {
              title: 'Limits',
              url: '#'
            }
          ]
        }
      ],
      quickActions: NAV_CONFIG.filter((item) => {
        if (!item.roles) return true
        return item.roles.includes(user?.role as Role)
      }).map((item) => ({
        name: t(item.titleKey),
        url: item.url,
        icon: item.icon
      }))
    }
  }, [t, user?.role])

  const activeSegment = React.useMemo(() => {
    const quickActionItems = data.quickActions
    const sortedNav = [...quickActionItems].sort((a, b) => b.url.length - a.url.length)
    const activeItem = sortedNav.find((item) => location.pathname.startsWith(item.url))
    return activeItem?.url
  }, [location.pathname, data.quickActions])

  const sidebarClassName = cn('top-14 h-[calc(100svh-3.5rem)]', className)

  return (
    <Sidebar collapsible='icon' className={sidebarClassName} {...props}>
      {/* <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader> */}
      <SidebarContent>
        <NavQuickActions items={data.quickActions} activeSegment={activeSegment} />
        {/* <NavMain items={data.navMain} /> */}
        <div className='mt-auto px-2.5 pb-2'>
          <SidebarTrigger />
        </div>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
