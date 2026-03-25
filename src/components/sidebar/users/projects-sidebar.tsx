import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem
} from '@/components/ui/sidebar'
import { useAuthStore } from '@/lib/zustand/auth.store'
import { cn } from '@/shared/utils'
import {
  CalendarDaysIcon,
  FileClockIcon,
  FolderOpenIcon,
  HistoryIcon,
  ShoppingBagIcon,
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
  const { user } = useAuthStore()

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
        title: 'Gói đang sử dụng',
        url: '/purchases',
        icon: ShoppingBagIcon
      },
      ...(user?.Role !== 'Mentor'
        ? [
            {
              title: t('project.sidebar.applicationHistory'),
              url: '/applications',
              icon: FileClockIcon
            }
          ]
        : []),
      ...(user?.Role === 'Mentor'
        ? [
            {
              title: t('mentorPackage.sidebar.meetingSessionPackages'),
              url: '/mentor-packages',
              icon: VideoIcon
            }
          ]
        : []),
      {
        title: t('pageTitle.transactions'),
        url: '/transactions',
        icon: HistoryIcon
      }
    ],
    [t, user?.Role]
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
