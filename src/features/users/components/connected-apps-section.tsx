import { Spinner } from '@/components/ui/spinner'
import { Switch } from '@/components/ui/switch'
import { CalendarDaysIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router'
import { useGetGoogleAuthUrl } from '../hooks/use-get-google-auth-url'
import { useGetUser } from '../hooks/use-get-user'

export default function ConnectedAppsSection() {
  const { t } = useTranslation()

  const { userIdentifier } = useParams<{ userIdentifier: string }>()
  const { user: me } = useGetUser({ userIdentifier })

  const { getGoogleAuthUrl, isGettingGoogleAuthUrl } = useGetGoogleAuthUrl()

  const handleConnectGoogleCalendar = async () => {
    const googleAuthUrl = await getGoogleAuthUrl()
    if (!googleAuthUrl) return

    window.location.assign(googleAuthUrl)
  }

  return (
    <div className='flex items-center gap-2 justify-between'>
      <div className='flex items-center gap-2'>
        <CalendarDaysIcon className='size-4' />
        <p className='text-sm font-medium'>{t('user.profileDialog.googleCalendar')}</p>
      </div>
      <div className='flex items-center gap-2'>
        {isGettingGoogleAuthUrl && <Spinner />}
        <Switch
          checked={!!me?.isGrantGoogleCalendarAccess}
          disabled={isGettingGoogleAuthUrl || me?.isGrantGoogleCalendarAccess}
          onCheckedChange={handleConnectGoogleCalendar}
        />
      </div>
    </div>
  )
}
