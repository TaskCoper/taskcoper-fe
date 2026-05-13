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
import { cn } from '@/shared/utils'
import { ChevronRight, type LucideIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link, matchPath, useLocation } from 'react-router'

export function NavMain({
  items
}: {
  items: {
    title: string
    url: string
    icon?: LucideIcon
    isActive?: boolean
    items?: {
      title: string
      url: string
      activePatterns?: string[]
      activeExcludePatterns?: string[]
    }[]
  }[]
}) {
  const { t } = useTranslation()
  const { pathname } = useLocation()

  const isSubItemActive = (subItem: { url: string; activePatterns?: string[]; activeExcludePatterns?: string[] }) => {
    const patterns = subItem.activePatterns?.length ? subItem.activePatterns : [subItem.url]
    const excludes = subItem.activeExcludePatterns ?? []

    const isExcluded = excludes.some((pattern) => Boolean(matchPath({ path: pattern, end: false }, pathname)))
    if (isExcluded) {
      return false
    }

    return patterns.some((pattern) => Boolean(matchPath({ path: pattern, end: true }, pathname)))
  }

  if (!items.length) {
    return null
  }

  return (
    <SidebarGroup className='group-data-[collapsible=icon]:pt-0'>
      <SidebarGroupLabel className='group-data-[collapsible=icon]:hidden'>
        {t('mentorPackage.sidebar.menu')}
      </SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => {
          const dedicatedUrl = item.url
          const hasActiveSubItem = item.items?.some((subItem) => isSubItemActive(subItem))

          return (
            <Collapsible
              key={item.title}
              asChild
              defaultOpen={Boolean(hasActiveSubItem) || item.isActive}
              className='group/collapsible'
            >
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton
                    asChild
                    tooltip={item.title}
                    className={cn(
                      hasActiveSubItem &&
                        'group-data-[collapsible=icon]:bg-primary/10 group-data-[collapsible=icon]:text-primary'
                    )}
                  >
                    <Link to={dedicatedUrl} className='w-full min-w-0'>
                      {item.icon && <item.icon />}
                      <span className='truncate whitespace-nowrap'>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </CollapsibleTrigger>

                {item.items?.length ? (
                  <>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuAction className='data-[state=open]:rotate-90'>
                        <ChevronRight />
                        <span className='sr-only'>{t('common.ui.toggle')}</span>
                      </SidebarMenuAction>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {item.items.map((subItem) => {
                          const active = isSubItemActive(subItem)

                          return (
                            <SidebarMenuSubItem key={subItem.title}>
                              <SidebarMenuSubButton
                                asChild
                                className={cn(active && 'bg-primary/10 text-primary font-medium')}
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
