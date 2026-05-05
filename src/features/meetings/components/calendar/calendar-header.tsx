import { Button } from '@/components/ui/button'
import { ButtonGroup } from '@/components/ui/button-group'
import { useGetMe } from '@/features/auth/hooks/use-get-me'
import { CalendarCogIcon, ChevronLeftIcon, ChevronRightIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

export type CalendarViewMode = 'day' | 'week' | 'month'

interface CalendarHeaderProps {
  title: string
  viewMode: CalendarViewMode
  displayConfigButton?: boolean
  onViewModeChange: (mode: CalendarViewMode) => void
  onPrev: () => void
  onNext: () => void
  onToday: () => void
}

export default function CalendarHeader({
  title,
  viewMode,
  displayConfigButton = false,
  onViewModeChange,
  onPrev,
  onNext,
  onToday
}: CalendarHeaderProps) {
  const { t } = useTranslation()
  const { me: user } = useGetMe()

  return (
    <div className='flex items-center border-b shrink-0 gap-2 h-13 px-2.5'>
      <div className='flex items-center gap-2'>
        {user?.role === 'Mentor' && displayConfigButton ? (
          <Link to='/calendar/schedules' className='block'>
            <Button size='sm' variant='outline' className='w-full justify-start gap-2'>
              <CalendarCogIcon />
              {t('schedule.button.viewSchedules')}
            </Button>
          </Link>
        ) : null}

        <Button size='sm' variant='outline' onClick={onToday}>
          {t('common.ui.today')}
        </Button>

        <div className='flex items-center gap-0.5'>
          <Button variant='ghost' size='icon-sm' onClick={onPrev}>
            <ChevronLeftIcon />
          </Button>
          <Button variant='ghost' size='icon-sm' onClick={onNext}>
            <ChevronRightIcon />
          </Button>
        </div>

        <p className='text-lg font-semibold'>{title}</p>
      </div>

      <div className='flex-1' />

      <ButtonGroup>
        {(['day', 'week', 'month'] as const).map((mode) => (
          <Button
            key={mode}
            size='sm'
            onClick={() => onViewModeChange(mode)}
            variant={viewMode === mode ? 'default' : 'outline'}
          >
            {mode === 'day' ? t('common.ui.day') : mode === 'week' ? t('common.ui.week') : t('common.ui.month')}
          </Button>
        ))}
      </ButtonGroup>
    </div>
  )
}
