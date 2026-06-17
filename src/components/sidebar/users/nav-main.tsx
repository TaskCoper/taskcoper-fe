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
  SidebarMenuSubItem,
  useSidebar
} from '@/components/ui/sidebar'
import { activePrimaryControlClasses } from '@/shared/effects'
import { cn } from '@/shared/utils'
import { ChevronRight, type LucideIcon } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, matchPath, useLocation } from 'react-router'

type SubItem = {
  title: string
  url: string
  activePatterns?: string[]
  activeExcludePatterns?: string[]
}

type NavItem = {
  title: string
  url: string
  icon?: LucideIcon
  isActive?: boolean
  items?: SubItem[]
}

function NavMainItem({ item, isSubItemActive }: { item: NavItem; isSubItemActive: (subItem: SubItem) => boolean }) {
  const { t } = useTranslation()
  const { state, setOpen } = useSidebar()
  const isCollapsed = state === 'collapsed'

  const hasActiveSubItem = item.items?.some((subItem) => isSubItemActive(subItem))
  const [open, setOpenCollapsible] = useState(Boolean(hasActiveSubItem) || Boolean(item.isActive))
  const activeParent = Boolean(hasActiveSubItem) && isCollapsed

  const handleLinkClick = () => {
    if (isCollapsed) {
      setOpen(true)
      setOpenCollapsible(true)
    }
  }

  return (
    <Collapsible asChild open={open} onOpenChange={setOpenCollapsible} className='group/collapsible'>
      <SidebarMenuItem>
        <CollapsibleTrigger asChild>
          <SidebarMenuButton
            asChild
            tooltip={item.title}
            className={cn('hover:bg-muted-foreground/15', activeParent && activePrimaryControlClasses)}
          >
            <Link to={item.url} className='w-full min-w-0' onClick={handleLinkClick}>
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
                        className={cn(active && !isCollapsed && activePrimaryControlClasses)}
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
}

export function NavMain({ items }: { items: NavItem[] }) {
  const { t } = useTranslation()
  const { pathname } = useLocation()

  const isSubItemActive = (subItem: SubItem) => {
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
        {items.map((item) => (
          <NavMainItem key={item.title} item={item} isSubItemActive={isSubItemActive} />
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}
