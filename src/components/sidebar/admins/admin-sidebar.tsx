import { NavAdmin } from '@/components/sidebar/admins/nav-admin'
import { TeamSwitcher } from '@/components/sidebar/admins/team-switcher'
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail } from '@/components/ui/sidebar'
import { Skeleton } from '@/components/ui/skeleton'
import { useGetMe } from '@/features/auth/hooks/use-get-me'
import { AudioWaveform, CircleUserRound, Command, FoldersIcon, GalleryVerticalEnd, GaugeIcon } from 'lucide-react'
import * as React from 'react'
import { useLocation } from 'react-router'
import { NavMain } from './nav-main'
import { NavSecondary } from './nav-secondary'

interface AdminSidebarProps extends React.ComponentProps<typeof Sidebar> {
  basePath: '/dashboard' | '/manage'
}

export function AdminSidebar({ basePath, ...props }: AdminSidebarProps) {
  const { me, isGettingMe } = useGetMe()
  const { pathname } = useLocation()

  const navItems = React.useMemo(() => {
    return {
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
          name: 'Dashboard',
          url: basePath,
          icon: GaugeIcon,
          isActive: pathname === basePath
        }
      ],
      navSecondary: [
        {
          title: 'Dự án',
          url: `${basePath}/projects`,
          icon: FoldersIcon,
          isActive: pathname.startsWith(`${basePath}/projects`),
          items: [
            {
              title: 'Danh sách dự án',
              url: `${basePath}/projects`
            },
            {
              title: 'Cài đặt',
              url: `${basePath}/projects/settings`
            }
          ]
        },
        {
          title: 'Người dùng',
          url: `${basePath}/users`,
          icon: CircleUserRound,
          isActive: pathname.startsWith(`${basePath}/users`),
          items: [
            {
              title: 'Danh sách người dùng',
              url: `${basePath}/users`
            },
            {
              title: 'Vai trò',
              url: `${basePath}/users/roles`
            },
            {
              title: 'Quyền hạn',
              url: `${basePath}/users/permissions`
            }
          ]
        }
      ]
    }
  }, [basePath, pathname])

  return (
    <Sidebar collapsible='icon' {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={navItems.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navItems.navMain} />
        <NavSecondary items={navItems.navSecondary} />
      </SidebarContent>
      <SidebarFooter>
        {isGettingMe ? <Skeleton className='h-10 w-full rounded-md' /> : <NavAdmin user={me} />}
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
