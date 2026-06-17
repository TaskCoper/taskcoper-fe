import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
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
import { useSignOut } from '@/features/auth/hooks/use-sign-out'
import type { Me } from '@/features/users/types'
import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { getAvatarFallback } from '@/shared/utils'
import { useQueryClient } from '@tanstack/react-query'
import { GlobeIcon, LogOut, SettingsIcon, UserCircle2Icon } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router'

interface NavUserProps {
  user?: Me | null
}

export default function NavUser({ user }: NavUserProps) {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const { t, i18n } = useTenantTranslation()
  const [language, setLanguage] = useState(i18n.language)
  // const [open, setOpen] = useState(false)

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

  if (!user) {
    return (
      <div className='flex items-center gap-2'>
        <Button asChild variant='ghost' size='sm'>
          <Link to='/sign-in'>{t('auth.signIn.label')}</Link>
        </Button>
        <Button asChild size='sm'>
          <Link to='/sign-up'>{t('auth.signUp.label')}</Link>
        </Button>
      </div>
    )
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger>
          <Avatar className='size-6 border ring-primary ring-offset-2 ring-2 rounded-full cursor-pointer'>
            <AvatarImage src={user?.avatar || undefined} alt={user?.email} />
            <AvatarFallback className='rounded-lg text-xs'>
              {getAvatarFallback(`${user?.firstName} ${user?.lastName}`)}
            </AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className='w-(--radix-dropdown-menu-trigger-width) min-w-60 rounded-lg mt-1'
          side='bottom'
          align='end'
          sideOffset={8}
        >
          <DropdownMenuLabel className='px-3 font-normal'>
            <div className='flex items-center gap-3 text-left text-sm'>
              <Avatar className='size-6 border ring-primary ring-offset-2 ring-2 rounded-full'>
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
            <DropdownMenuItem onSelect={() => navigate(`/users/${user?.slug}`)}>
              <UserCircle2Icon />
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
          <DropdownMenuItem onSelect={() => navigate(`/users/${user?.slug}/settings`)}>
            <SettingsIcon />
            {t('account.settings')}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className='focus:text-destructive' onClick={onSignOut} disabled={isSigningOut}>
            <LogOut className='focus:text-destructive' />
            {t('account.logout')}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* <ProfileDetailDialog open={open} onOpenChange={setOpen} /> */}
    </>
  )
}
