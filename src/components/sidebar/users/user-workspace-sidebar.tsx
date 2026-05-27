import { NavQuickActions } from '@/components/sidebar/users/nav-quick-actions'
import { Sidebar, SidebarContent, SidebarRail, SidebarTrigger } from '@/components/ui/sidebar'
import { useGetMe } from '@/features/auth/hooks/use-get-me'
import type { Role } from '@/features/users/types'
import type { I18nKey } from '@/lib/i18n/types'
import { cn } from '@/shared/utils'
import {
  CalendarDaysIcon,
  FileClockIcon,
  FolderOpenIcon,
  HistoryIcon,
  ShoppingBagIcon,
  TicketPercentIcon,
  VideoIcon,
  type LucideIcon
} from 'lucide-react'
import * as React from 'react'
import { useTranslation } from 'react-i18next'
import { NavMain } from './nav-main'

type NavItem = {
  titleKey: I18nKey
  url: string
  icon: LucideIcon
  activePatterns?: string[]
  activeExcludePatterns?: string[]
}

type NavItemConfig = NavItem & {
  roles?: Role[]
}

type NavMainSubItemConfig = {
  titleKey: I18nKey
  url: string
  activePatterns?: string[]
  activeExcludePatterns?: string[]
}

type NavMainItemConfig = {
  titleKey: I18nKey
  url: string
  icon: LucideIcon
  items: NavMainSubItemConfig[]
  roles?: Role[]
}

const NAV_CONFIG: NavItemConfig[] = [
  {
    titleKey: 'project.sidebar.myProjects',
    url: '/projects',
    icon: FolderOpenIcon,
    activePatterns: ['/projects', '/projects/:identifier/*']
  },
  {
    titleKey: 'project.sidebar.myCalendar',
    url: '/calendar',
    icon: CalendarDaysIcon,
    activePatterns: ['/calendar', '/calendar/*']
  },
  {
    titleKey: 'purchaseHistory.title',
    url: '/purchases',
    icon: ShoppingBagIcon,
    activePatterns: [
      '/purchases',
      '/purchases/:packageId',
      '/purchases/:packageId/meetings/:meetingId',
      '/requests/:requestId'
    ]
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

const NAV_MAIN_CONFIG: NavMainItemConfig[] = [
  {
    titleKey: 'mentorPackage.page.title',
    url: '/packages',
    icon: VideoIcon,
    roles: ['Mentor'],
    items: [
      {
        titleKey: 'mentorPackage.sidebar.overview',
        url: '/packages/dashboard',
        activePatterns: ['/packages/dashboard']
      },
      {
        titleKey: 'mentorPackage.sidebar.packageList',
        url: '/packages',
        activePatterns: ['/packages', '/packages/:packageId'],
        activeExcludePatterns: ['/packages/dashboard']
      },
      {
        titleKey: 'mentorPackage.sidebar.requests',
        url: '/requests',
        activePatterns: ['/requests']
      }
    ]
  }
]

export function UserWorkspaceSidebar({ className, ...props }: React.ComponentProps<typeof Sidebar>) {
  const { me: user } = useGetMe()
  const { t } = useTranslation()

  const data = React.useMemo(() => {
    return {
      navMain: NAV_MAIN_CONFIG.filter((item) => {
        if (!item.roles) return true
        return item.roles.includes(user?.role as Role)
      }).map((item) => ({
        title: t(item.titleKey),
        url: item.url,
        icon: item.icon,
        items: item.items.map((subItem) => ({
          title: t(subItem.titleKey),
          url: subItem.url,
          activePatterns: subItem.activePatterns,
          activeExcludePatterns: subItem.activeExcludePatterns
        }))
      })),
      quickActions: NAV_CONFIG.filter((item) => {
        if (!item.roles) return true
        return item.roles.includes(user?.role as Role)
      }).map((item) => ({
        name: t(item.titleKey),
        url: item.url,
        icon: item.icon,
        activePatterns: item.activePatterns,
        activeExcludePatterns: item.activeExcludePatterns
      }))
    }
  }, [t, user?.role])

  const sidebarClassName = cn('top-14 h-[calc(100svh-3.5rem)]', className)

  return (
    <Sidebar collapsible='icon' className={sidebarClassName} {...props}>
      {/* <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader> */}
      <SidebarContent className='gap-1'>
        <NavQuickActions items={data.quickActions} />
        <NavMain items={data.navMain} />
        <div className='mt-auto px-2.5 pb-2'>
          <SidebarTrigger />
        </div>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
