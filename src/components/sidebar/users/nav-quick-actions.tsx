import { SidebarGroup, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar'
import { cn } from '@/shared/utils'
import { type LucideIcon } from 'lucide-react'
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
  return (
    <SidebarGroup className='group-data-[collapsible=icon]:pb-0'>
      <SidebarMenu>
        {items.map((item) => (
          <SidebarMenuItem
            key={item.name}
            className={cn(
              activeSegment === item.url
                ? 'bg-primary/10 text-primary rounded-md group-data-[collapsible=icon]:bg-primary/10'
                : ''
            )}
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
