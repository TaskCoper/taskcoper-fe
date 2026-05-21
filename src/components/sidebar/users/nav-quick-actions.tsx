import { SidebarGroup, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar'
import { cn } from '@/shared/utils'
import { type LucideIcon } from 'lucide-react'
import { Link, matchPath, useLocation } from 'react-router'

export function NavQuickActions({
  items
}: {
  items: {
    name: string
    url: string
    icon: LucideIcon
    activePatterns?: string[]
    activeExcludePatterns?: string[]
  }[]
}) {
  const { pathname } = useLocation()

  const isItemActive = (item: { url: string; activePatterns?: string[]; activeExcludePatterns?: string[] }) => {
    const patterns = item.activePatterns?.length ? item.activePatterns : [item.url]
    const excludes = item.activeExcludePatterns ?? []

    const isExcluded = excludes.some((pattern) => Boolean(matchPath({ path: pattern, end: false }, pathname)))
    if (isExcluded) {
      return false
    }

    return patterns.some((pattern) => Boolean(matchPath({ path: pattern, end: true }, pathname)))
  }

  return (
    <SidebarGroup className='group-data-[collapsible=icon]:pb-0'>
      <SidebarMenu>
        {items.map((item) => {
          const active = isItemActive(item)

          return (
            <SidebarMenuItem
              key={item.name}
              className={cn(
                active ? 'bg-primary/10 text-primary rounded-md group-data-[collapsible=icon]:bg-primary/10' : ''
              )}
            >
              <SidebarMenuButton asChild>
                <Link to={item.url}>
                  <item.icon />
                  <span>{item.name}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}
