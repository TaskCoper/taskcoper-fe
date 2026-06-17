import { Button } from '@/components/ui/button'
import { useGetMe } from '@/features/auth/hooks/use-get-me'
import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { useMentorWidgetStore } from '@/lib/zustand/mentor-widget.store'
import { getUserType } from '@/shared/utils'
import { GraduationCap, XIcon } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router'

export default function BecomeMentorWidget() {
  const navigate = useNavigate()
  const { t } = useTenantTranslation()
  const { pathname } = useLocation()

  const { me, isGettingMe } = useGetMe()
  const { dismiss, isDismissed } = useMentorWidgetStore()

  const userType = getUserType(me)
  const isMentor = me?.role?.toLowerCase() === 'mentor'
  const isAtRoute = pathname.startsWith('/network') || pathname.startsWith('/projects')

  if (!me || userType !== 'user' || isGettingMe || isMentor || isDismissed() || !isAtRoute) {
    return null
  }

  return (
    <div className='fixed bottom-4 left-4 right-4 z-50 mx-auto w-auto sm:left-auto sm:right-4 sm:mx-0 sm:w-80 animate-in fade-in slide-in-from-bottom-4 duration-500'>
      <div className='relative overflow-hidden border-2 border-white p-4 sm:p-3 shadow-2xl bg-linear-to-br from-primary/90 via-teal-600/80 to-emerald-600/80 backdrop-blur-md flex flex-col gap-3 sm:gap-4 rounded-xl'>
        <div className='absolute inset-0 bg-linear-to-tr from-white/5 to-transparent pointer-events-none' />

        <div className='relative flex items-start gap-3'>
          <div className='flex size-10 sm:size-9 shrink-0 items-center justify-center rounded-lg bg-white/10 border border-white/20 shadow-sm'>
            <GraduationCap className='size-6 text-white' />
          </div>

          <div className='flex-1 min-w-0 pr-6 sm:pr-0'>
            <p className='text-sm sm:text-xs md:text-sm text-white font-semibold leading-tight'>
              {t('mentorApplication.widget.title')}
            </p>
            <p className='text-xs text-white/80 mt-0.5'>{t('mentorApplication.widget.description')}</p>
          </div>

          <Button
            variant='ghost'
            size='icon'
            className='absolute -top-1 -right-1 sm:relative sm:top-0 sm:right-0 h-8 w-8 text-white/60 hover:bg-white/10 hover:text-white transition-colors'
            onClick={dismiss}
            aria-label={t('mentorApplication.widget.dismiss')}
          >
            <XIcon className='size-4' />
          </Button>
        </div>

        <Button
          size='default'
          className='w-full bg-white text-teal-700 hover:bg-slate-50 font-bold shadow-lg shadow-black/10 transition-all active:scale-[0.98] border-0 h-10 sm:h-9'
          onClick={() => navigate('/commissions')}
        >
          {t('mentorApplication.widget.applyNow')}
        </Button>
      </div>
    </div>
  )
}
