import { NavAdmin } from '@/components/sidebar/admins/nav-admin'
import { TeamSwitcher } from '@/components/sidebar/admins/team-switcher'
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail } from '@/components/ui/sidebar'
import { Skeleton } from '@/components/ui/skeleton'
import { useGetMe } from '@/features/auth/hooks/use-get-me'
import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import {
  AudioWaveform,
  CircleUserRound,
  Command,
  FileClockIcon,
  FoldersIcon,
  GalleryVerticalEnd,
  GaugeIcon,
  PercentIcon
} from 'lucide-react'
import * as React from 'react'
import { useLocation } from 'react-router'
import NavMain from './nav-main'
import NavSecondary from './nav-secondary'

interface AdminSidebarProps extends React.ComponentProps<typeof Sidebar> {
  basePath: '/dashboard' | '/manage'
}

export function AdminSidebar({ basePath, ...props }: AdminSidebarProps) {
  const { me, isGettingMe } = useGetMe()
  const { pathname } = useLocation()
  const { t } = useTenantTranslation()

  const navItems = React.useMemo(() => {
    return {
      teams: [
        {
          name: t('adminSidebar.teams.acmeInc.name'),
          logo: GalleryVerticalEnd,
          plan: t('adminSidebar.teams.acmeInc.plan')
        },
        {
          name: t('adminSidebar.teams.acmeCorp.name'),
          logo: AudioWaveform,
          plan: t('adminSidebar.teams.acmeCorp.plan')
        },
        {
          name: t('adminSidebar.teams.evilCorp.name'),
          logo: Command,
          plan: t('adminSidebar.teams.evilCorp.plan')
        }
      ],
      navMain: [
        {
          name: t('adminSidebar.main.dashboard'),
          url: basePath,
          icon: GaugeIcon,
          isActive: pathname === basePath
        }
      ],
      navSecondary: [
        {
          title: t('adminSidebar.system.projects.title'),
          url: `${basePath}/projects`,
          icon: FoldersIcon,
          isActive: pathname.startsWith(`${basePath}/projects`),
          items: [
            {
              title: t('adminSidebar.system.projects.list'),
              url: `${basePath}/projects`
            },
            {
              title: t('adminSidebar.system.projects.settings'),
              url: `${basePath}/projects/settings`
            }
          ]
        },
        {
          title: t('adminSidebar.system.users.title'),
          url: `${basePath}/users`,
          icon: CircleUserRound,
          isActive: pathname.startsWith(`${basePath}/users`),
          items: [
            {
              title: t('adminSidebar.system.users.list'),
              url: `${basePath}/users`
            },
            {
              title: t('adminSidebar.system.users.roles'),
              url: `${basePath}/users/roles`
            },
            {
              title: t('adminSidebar.system.users.permissions'),
              url: `${basePath}/users/permissions`
            }
          ]
        },
        {
          title: t('mentorApplication.sidebar.title'),
          url: `${basePath}/applications`,
          icon: FileClockIcon,
          isActive: pathname.startsWith(`${basePath}/applications`),
          items: [
            {
              title: t('mentorApplication.sidebar.list'),
              url: `${basePath}/applications`
            }
          ]
        },
        {
          title: t('adminSidebar.system.commissions.title'),
          url: `${basePath}/commisions`,
          icon: PercentIcon,
          isActive: pathname.startsWith(`${basePath}/commisions`),
          items: [
            {
              title: t('adminSidebar.system.commissions.config'),
              url: `${basePath}/commisions`
            }
          ]
        }
      ]
    }
  }, [basePath, pathname, t])

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
