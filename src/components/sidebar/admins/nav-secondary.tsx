import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem
} from '@/components/ui/sidebar'
import { ChevronRight, type LucideIcon } from 'lucide-react'
import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { Link, useLocation } from 'react-router'

export default function NavSecondary({
  items
}: {
  items: {
    title: string
    url: string
    icon: LucideIcon
    isActive?: boolean
    items?: {
      title: string
      url: string
      activeUrls?: string[]
    }[]
  }[]
}) {
  const location = useLocation()
  const { t } = useTenantTranslation()

  return (
    <SidebarGroup>
      <SidebarGroupLabel>{t('adminSidebar.system.groupLabel')}</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => {
          const isParentActive =
            item.url !== '#' ? location.pathname === item.url || location.pathname.startsWith(item.url + '/') : false

          const hasActiveSubItem = item.items?.some(
            (subItem) =>
              location.pathname === subItem.url ||
              location.pathname.startsWith(subItem.url + '/') ||
              subItem.activeUrls?.includes(location.pathname)
          )

          const isActive = isParentActive || hasActiveSubItem

          return (
            <Collapsible key={item.title} asChild defaultOpen={isActive}>
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton asChild tooltip={item.title}>
                    <Link to={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                {item.items?.length ? (
                  <>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuAction className='data-[state=open]:rotate-90'>
                        <ChevronRight />
                        <span className='sr-only'>{t('adminSidebar.system.toggle')}</span>
                      </SidebarMenuAction>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {item.items.map((subItem) => {
                          const isSubItemActive =
                            location.pathname === subItem.url ||
                            location.pathname.startsWith(subItem.url + '/') ||
                            subItem.activeUrls?.includes(location.pathname)

                          return (
                            <SidebarMenuSubItem key={subItem.title}>
                              <SidebarMenuSubButton
                                asChild
                                className={isSubItemActive ? 'bg-primary/10 text-primary font-medium' : ''}
                              >
                                <Link to={subItem.url}>
                                  <span>{subItem.title}</span>
                                </Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          )
                        })}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </>
                ) : null}
              </SidebarMenuItem>
            </Collapsible>
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}
