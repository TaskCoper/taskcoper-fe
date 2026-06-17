import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from '@/components/ui/sidebar'
import { useSignOut } from '@/features/auth/hooks/use-sign-out'
import ProfileDetailDialog from '@/features/users/components/profile-detail-dialog'
import type { Me } from '@/features/users/types'
import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { getAvatarFallback } from '@/shared/utils'
import { useQueryClient } from '@tanstack/react-query'
import { ChevronsUpDown, GlobeIcon, LogOut, UserRoundIcon } from 'lucide-react'
import { useState } from 'react'

interface NavAdminProps {
  user?: Me | null
}

export function NavAdmin({ user }: NavAdminProps) {
  const queryClient = useQueryClient()
  const { isMobile } = useSidebar()
  const { t, i18n } = useTenantTranslation()
  const [language, setLanguage] = useState(i18n.language)
  const [open, setOpen] = useState(false)

  const { signOut, isSigningOut } = useSignOut()

  const onSignOut = () => {
    if (!user?.email) return

    signOut({ email: user.email })
  }

  const handleLanguageChange = async (value: string) => {
    setLanguage(value)
    await i18n.changeLanguage(value)
    queryClient.invalidateQueries()
  }

  return (
    <>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size='lg'
                className='data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground'
              >
                <Avatar className='h-8 w-8 rounded-lg'>
                  <AvatarImage src={user?.avatar || undefined} alt={user?.email} />
                  <AvatarFallback className='rounded-lg text-xs'>
                    {getAvatarFallback(`${user?.firstName} ${user?.lastName}`)}
                  </AvatarFallback>
                </Avatar>
                <div className='grid flex-1 text-left text-sm leading-tight'>
                  <span className='truncate font-medium'>
                    {user?.firstName} {user?.lastName}
                  </span>
                  <span className='truncate text-xs'>{user?.email}</span>
                </div>
                <ChevronsUpDown className='ml-auto size-4' />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className='w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg'
              side={isMobile ? 'bottom' : 'right'}
              align='end'
              sideOffset={8}
            >
              <DropdownMenuLabel className='p-0 font-normal'>
                <div className='flex items-center gap-2 px-1 py-1.5 text-left text-sm'>
                  <Avatar className='h-8 w-8 rounded-lg'>
                    <AvatarImage src={user?.avatar || undefined} alt={user?.email} />
                    <AvatarFallback className='rounded-lg text-xs'>
                      {getAvatarFallback(`${user?.firstName} ${user?.lastName}`)}
                    </AvatarFallback>
                  </Avatar>
                  <div className='grid flex-1 text-left text-sm leading-tight'>
                    <span className='truncate font-medium'>
                      {user?.firstName} {user?.lastName}
                    </span>
                    <span className='truncate text-xs'>{user?.email}</span>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem
                  onSelect={(e) => {
                    e.preventDefault()
                    setOpen(true)
                  }}
                  className={open ? 'text-primary bg-primary/10' : ''}
                >
                  <UserRoundIcon className={open ? 'text-primary' : ''} />
                  {t('account.account')}
                </DropdownMenuItem>
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    <GlobeIcon />
                    {t('account.language')}
                  </DropdownMenuSubTrigger>
                  <DropdownMenuPortal>
                    <DropdownMenuSubContent>
                      <DropdownMenuRadioGroup value={language || 'en-US'} onValueChange={handleLanguageChange}>
                        <DropdownMenuRadioItem value='en-US'>{t('language.english')}</DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value='vi-VN'>{t('language.vietnamese')}</DropdownMenuRadioItem>
                      </DropdownMenuRadioGroup>
                    </DropdownMenuSubContent>
                  </DropdownMenuPortal>
                </DropdownMenuSub>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem className='focus:text-destructive' onClick={onSignOut} disabled={isSigningOut}>
                <LogOut className='focus:text-destructive' />
                {t('account.logout')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>

      <ProfileDetailDialog open={open} onOpenChange={setOpen} />
    </>
  )
}
