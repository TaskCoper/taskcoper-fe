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
import PasswordSection from '@/features/users/components/password-section'
import ProfileSection from '@/features/users/components/profile-section'
import { cn } from '@/shared/utils'
import { CircleUserRoundIcon, LockKeyholeIcon, type LucideIcon } from 'lucide-react'
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
    id: 2,
    nameKey: 'user.profileDialog.password',
    icon: LockKeyholeIcon,
    content: <PasswordSection />
  }
]

export default function SettingsPage() {
  const { t } = useTranslation()
  const [selected, setSelected] = useState<NavItem>(navItems[0])

  return (
    <div className='min-h-screen bg-muted/30'>
      <div className='mx-auto flex max-w-6xl'>
        <SidebarProvider className='flex w-full min-h-screen'>
          {/* Sidebar */}
          <Sidebar collapsible='none' className='hidden md:flex w-72 border-r bg-background'>
            <SidebarContent className='py-8 px-4'>
              {/* Title */}
              <div className='mb-6 px-3'>
                <h2 className='text-xl font-bold'>{t('user.profileDialog.settings', 'Settings')}</h2>
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
                            className={cn(
                              'w-full rounded-lg px-3 py-2.5 cursor-pointer transition-all',
                              isActive
                                ? 'bg-muted font-semibold'
                                : 'hover:bg-muted/60 text-muted-foreground hover:text-foreground'
                            )}
                          >
                            <div className='flex items-center gap-3'>
                              <item.icon
                                className={cn('h-5 w-5', isActive ? 'text-foreground' : 'text-muted-foreground')}
                              />
                              <span className='text-sm'>{t(item.nameKey)}</span>
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
          <div className='flex-1 bg-muted/20'>
            <div className='border-b bg-background px-10 py-6'>
              <div className='flex items-center gap-3'>
                <selected.icon className='h-5 w-5 text-muted-foreground' />
                <h1 className='text-lg font-semibold'>{t(selected.nameKey)}</h1>
              </div>
            </div>

            <div className='px-10 py-8 min-h-[800px]'>
              <div className='max-w-3xl'>{selected.content}</div>
            </div>
          </div>
        </SidebarProvider>
      </div>
    </div>
  )
}
