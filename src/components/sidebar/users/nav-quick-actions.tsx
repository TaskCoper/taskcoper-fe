import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem
} from '@/components/ui/sidebar'
import { cn } from '@/shared/utils'
import { type LucideIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

export function NavQuickActions({
  items,
  activeSegment
}: {
  items: {
    name: string
    url: string
    icon: LucideIcon
  }[]
  activeSegment?: string
}) {
  const { t } = useTranslation()

  return (
    <SidebarGroup>
      <SidebarGroupLabel>{t('project.sidebar.quickActions')}</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => (
          <SidebarMenuItem
            key={item.name}
            className={cn(activeSegment === item.url && 'bg-primary/10 text-primary rounded-md')}
          >
            <SidebarMenuButton asChild>
              <Link to={item.url}>
                <item.icon />
                <span>{item.name}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}
