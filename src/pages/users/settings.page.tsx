import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider
} from '@/components/ui/sidebar'
import ConnectedAppsSection from '@/features/users/components/connected-apps-section'
import PasswordSection from '@/features/users/components/password-section'
import ProfileSection from '@/features/users/components/profile-section'
import { cn } from '@/shared/utils'
import { CircleUserRoundIcon, LockKeyholeIcon, PuzzleIcon, type LucideIcon } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

interface NavItem {
  id: number
  nameKey: string
  icon: LucideIcon
  content: React.ReactNode
}

const navItems: NavItem[] = [
  {
    id: 1,
    nameKey: 'user.profileDialog.profileAndDisplay',
    icon: CircleUserRoundIcon,
    content: <ProfileSection />
  },
  {
    id: 50,
    nameKey: 'user.profileDialog.password',
    icon: LockKeyholeIcon,
    content: <PasswordSection />
  },
  {
    id: 100,
    nameKey: 'user.profileDialog.connectedApps',
    icon: PuzzleIcon,
    content: <ConnectedAppsSection />
  }
]

export default function SettingsPage() {
  const { t } = useTranslation()
  const [selected, setSelected] = useState<NavItem>(navItems[0])

  return (
    <div className='w-full h-full overflow-hidden bg-muted/30'>
      <div className='mx-auto flex max-w-7xl h-full w-full'>
        <SidebarProvider className='flex w-full h-full items-stretch'>
          {/* Sidebar */}
          <Sidebar collapsible='none' className='hidden md:flex shrink-0 border-r border-border/50'>
            <SidebarContent className='py-8 px-4'>
              {/* Title */}
              <div className='mb-6 px-3'>
                <h2 className='text-lg font-semibold'>{t('user.profileDialog.settings')}</h2>
              </div>

              <SidebarGroup>
                <SidebarGroupContent>
                  <SidebarMenu className='space-y-1'>
                    {navItems.map((item) => {
                      const isActive = item.id === selected.id

                      return (
                        <SidebarMenuItem key={item.id}>
                          <SidebarMenuButton
                            asChild
                            onClick={() => setSelected(item)}
                            className={cn(isActive && 'bg-primary/10 text-primary font-medium')}
                          >
                            <div className='flex items-center gap-2'>
                              <item.icon />
                              <span>{t(item.nameKey)}</span>
                            </div>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      )
                    })}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>
          </Sidebar>

          {/* Content */}
          <div className='flex-1 flex flex-col'>
            <header className='border-b bg-background px-4 py-4 shrink-0'>
              <div className='flex items-center gap-3'>
                <selected.icon className='h-5 w-5 text-muted-foreground' />
                <h1 className='text-lg font-semibold'>{t(selected.nameKey)}</h1>
              </div>
            </header>

            <div className='flex-1 overflow-y-auto px-4 py-8'>
              <div className='max-w-3xl mx-auto'>{selected.content}</div>
            </div>
          </div>
        </SidebarProvider>
      </div>
    </div>
  )
}
