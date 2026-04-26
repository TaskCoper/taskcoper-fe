import { Button } from '@/components/ui/button'
import { useGetMe } from '@/features/auth/hooks/use-get-me'
import { useVerifyGoogleCallback } from '@/features/users/hooks/use-verify-google-callback'
import { cn } from '@/shared/utils'
import { CalendarIcon, CheckCircle2Icon, Loader2Icon, XCircleIcon } from 'lucide-react'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'

type Status = 'loading' | 'success' | 'error'

function StatusCard({ status }: { status: Status }) {
  const { t } = useTranslation()

  const config = {
    loading: {
      icon: <Loader2Icon className='size-12 animate-spin text-primary' />,
      title: t('user.profileDialog.googleCallback.loading.title'),
      description: t('user.profileDialog.googleCallback.loading.description'),
      iconBg: 'bg-primary/10'
    },
    success: {
      icon: <CheckCircle2Icon className='size-12 text-emerald-500' />,
      title: t('user.profileDialog.googleCallback.success.title'),
      description: t('user.profileDialog.googleCallback.success.description'),
      iconBg: 'bg-emerald-500/10'
    },
    error: {
      icon: <XCircleIcon className='size-12 text-destructive' />,
      title: t('user.profileDialog.googleCallback.error.title'),
      description: t('user.profileDialog.googleCallback.error.description'),
      iconBg: 'bg-destructive/10'
    }
  }

  const { icon, title, description, iconBg } = config[status]

  return (
    <div className='flex flex-col items-center gap-6 text-center'>
      <div className={cn('flex size-24 items-center justify-center rounded-full', iconBg)}>{icon}</div>

      <div className='flex flex-col gap-2'>
        <h2 className='text-2xl font-bold tracking-tight'>{title}</h2>
        <p className='max-w-xs text-sm text-muted-foreground'>{description}</p>
      </div>

      {status === 'loading' && (
        <div className='flex items-center gap-2 text-xs text-muted-foreground'>
          <CalendarIcon className='size-3.5' />
          <span>{t('user.profileDialog.googleCallback.verifyingOauthToken')}</span>
        </div>
      )}

      {status === 'success' && (
        <div className='flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-4 py-1.5 text-xs font-medium text-emerald-600'>
          <span className='size-1.5 rounded-full bg-emerald-500 animate-pulse' />
          {t('user.profileDialog.googleCallback.connectedBadge')}
        </div>
      )}
    </div>
  )
}

export default function GoogleCallbackPage() {
  const navigate = useNavigate()
  const { me: user } = useGetMe()
  const { t } = useTranslation()
  const { verifyGoogleCallback, isVerifyingGoogleCallback, isGoogleCallbackSuccess, isGoogleCallbackError } =
    useVerifyGoogleCallback()

  const status: Status = isGoogleCallbackError ? 'error' : isGoogleCallbackSuccess ? 'success' : 'loading'

  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get('code')

    if (code) {
      verifyGoogleCallback(
        { code },
        {
          onSuccess: () => {
            setTimeout(() => navigate(`/users/${user?.id}`, { replace: true }), 1500)
          }
        }
      )
    }
  }, [verifyGoogleCallback, navigate, user?.id])

  return (
    <div className='bg-dot relative flex h-screen w-full items-center justify-center p-4'>
      <div className='flex aspect-square min-h-[480px] flex-col items-center justify-center gap-8 rounded-full bg-radial from-background/90 via-background/40 to-background/10 p-6 sm:px-16 sm:py-20'>
        <StatusCard status={isVerifyingGoogleCallback ? 'loading' : status} />

        {isGoogleCallbackError && (
          <Button variant='outline' onClick={() => navigate(-1)} className='mt-2'>
            {t('user.profileDialog.googleCallback.goBack')}
          </Button>
        )}
      </div>
    </div>
  )
}
