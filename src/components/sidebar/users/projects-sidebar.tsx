import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem
} from '@/components/ui/sidebar'
import { useGetMe } from '@/features/auth/hooks/use-get-me'
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
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useLocation } from 'react-router'

type NavItem = {
  title: string
  url: string
  icon: LucideIcon
}

export default function ProjectsSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { t } = useTranslation()
  const location = useLocation()
  const { me: user } = useGetMe()

  const navMain = useMemo(
    (): NavItem[] => [
      {
        title: t('project.sidebar.myProjects'),
        url: '/projects',
        icon: FolderOpenIcon
      },
      {
        title: t('project.sidebar.myCalendar'),
        url: '/calendar',
        icon: CalendarDaysIcon
      },

      {
        title: t('purchaseHistory.title'),
        url: '/purchases',
        icon: ShoppingBagIcon
      },
      ...(user?.role !== 'Mentor'
        ? [
            {
              title: t('project.sidebar.applicationHistory'),
              url: '/applications',
              icon: FileClockIcon
            }
          ]
        : []),
      ...(user?.role === 'Mentor'
        ? [
            {
              title: t('mentorPackage.sidebar.meetingSessionPackages'),
              url: '/packages',
              icon: VideoIcon
            },
            {
              title: t('voucher.sidebar.vouchers'),
              url: '/vouchers',
              icon: TicketPercentIcon
            }
          ]
        : []),
      {
        title: t('pageTitle.transactions'),
        url: '/transactions',
        icon: HistoryIcon
      }
    ],
    [t, user?.role]
  )

  const activeSegment = useMemo(() => {
    const sortedNav = [...navMain].sort((a, b) => b.url.length - a.url.length)
    const activeItem = sortedNav.find((item) => location.pathname.startsWith(item.url))

    return activeItem?.url
  }, [location.pathname, navMain])

  return (
    <Sidebar
      collapsible='icon'
      className={cn(
        'overflow-hidden *:data-[sidebar=sidebar]:flex-row',
        'top-14 h-[calc(100svh-3.5rem)]! border-r-0',
        props.className
      )}
      {...props}
    >
      <Sidebar collapsible='none' className='w-[calc(var(--sidebar-width-icon)+1px)]! border-r'>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent className='px-1.5 md:px-0'>
              <SidebarMenu>
                {navMain.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <Link to={item.url}>
                      <SidebarMenuButton
                        tooltip={{
                          children: item.title,
                          hidden: false
                        }}
                        className={cn('px-2.5 md:px-2', activeSegment === item.url && 'bg-primary/10 text-primary')}
                      >
                        <item.icon />
                        <span>{item.title}</span>
                      </SidebarMenuButton>
                    </Link>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
    </Sidebar>
  )
}
