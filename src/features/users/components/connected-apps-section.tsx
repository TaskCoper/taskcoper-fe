import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { Switch } from '@/components/ui/switch'
import { useGetMe } from '@/features/auth/hooks/use-get-me'
import { useTranslation } from 'react-i18next'
import { useGetGoogleAuthUrl } from '../hooks/use-get-google-auth-url'

export default function ConnectedAppsSection() {
  const { t } = useTranslation()
  const { me } = useGetMe()
  const { getGoogleAuthUrl, isGettingGoogleAuthUrl } = useGetGoogleAuthUrl()

  const handleConnectGoogleCalendar = async () => {
    const googleAuthUrl = await getGoogleAuthUrl()
    if (!googleAuthUrl) return

    window.location.assign(googleAuthUrl)
  }

  return (
    <div className='px-24 pb-6'>
      {me?.isGrantGoogleCalendarAccess ? (
        <div className='flex items-center gap-2 justify-between'>
          <p className='text-sm font-medium'>{t('user.profileDialog.googleCalendar')}</p>
          <Switch checked={me?.isGrantGoogleCalendarAccess} disabled />
        </div>
      ) : (
        <Button disabled={isGettingGoogleAuthUrl} onClick={handleConnectGoogleCalendar}>
          {isGettingGoogleAuthUrl ? <Spinner /> : null}
          {t('user.profileDialog.connectWithCalendar')}
        </Button>
      )}
    </div>
  )
}
