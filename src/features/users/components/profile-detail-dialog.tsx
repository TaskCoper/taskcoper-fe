import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
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
import { cn } from '@/shared/utils'
import { CircleUserRoundIcon, LockKeyholeIcon, type LucideIcon } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import PasswordSection from './password-section'
import ProfileSection from './profile-section'

interface ProfileDetailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  children?: React.ReactNode
}

interface NavItem {
  id: number
  nameKey: string
  icon: LucideIcon
  content: React.ReactNode
}

const navItems: NavItem[] = [
  { id: 1, nameKey: 'user.profileDialog.profileAndDisplay', icon: CircleUserRoundIcon, content: <ProfileSection /> },
  { id: 100, nameKey: 'user.profileDialog.password', icon: LockKeyholeIcon, content: <PasswordSection /> }
]

export default function ProfileDetailDialog({ open, onOpenChange, children }: ProfileDetailDialogProps) {
  const { t } = useTranslation()
  const [selected, setSelected] = useState<NavItem>(navItems[0])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {children && <DialogTrigger asChild>{children}</DialogTrigger>}
      <DialogContent position='top-center' className='p-0 overflow-hidden min-w-4xl'>
        <DialogTitle className='sr-only'>{t('user.profileDialog.profileTitle')}</DialogTitle>
        <DialogDescription className='sr-only'>{t('user.profileDialog.profileDescription')}</DialogDescription>
        <SidebarProvider className='items-start min-h-96'>
          <Sidebar collapsible='none' className='hidden md:flex shrink'>
            <SidebarContent>
              <SidebarGroup>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {navItems.map((item) => (
                      <SidebarMenuItem key={item.id}>
                        <SidebarMenuButton
                          asChild
                          onClick={() => setSelected(item)}
                          className={cn(item.id === selected.id && 'bg-primary/10 text-primary font-medium')}
                        >
                          <div className='flex items-center gap-2'>
                            <item.icon />
                            <span>{t(item.nameKey)}</span>
                          </div>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>
          </Sidebar>
          <div className='flex flex-1 flex-col gap-4 overflow-y-auto mt-6'>{selected.content}</div>
        </SidebarProvider>
      </DialogContent>
    </Dialog>
  )
}
