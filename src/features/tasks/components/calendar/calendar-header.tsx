import { Button } from '@/components/ui/button'
import { ButtonGroup } from '@/components/ui/button-group'
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react'

export type CalendarViewMode = 'day' | 'week' | 'month'

interface CalendarHeaderProps {
  title: string
  viewMode: CalendarViewMode
  onViewModeChange: (mode: CalendarViewMode) => void
  onPrev: () => void
  onNext: () => void
  onToday: () => void
}

export default function CalendarHeader({
  title,
  viewMode,
  onViewModeChange,
  onPrev,
  onNext,
  onToday
}: CalendarHeaderProps) {
  return (
    <div className='flex items-center justify-between px-4 py-2 border-b shrink-0'>
      <div className='flex items-center gap-3'>
        <Button variant='outline' size='sm' onClick={onToday}>
          Today
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

      <ButtonGroup>
        {(['day', 'week', 'month'] as const).map((mode) => (
          <Button
            key={mode}
            size='sm'
            onClick={() => onViewModeChange(mode)}
            variant={viewMode === mode ? 'default' : 'outline'}
          >
            {mode === 'day' ? 'Day' : mode === 'week' ? 'Week' : 'Month'}
          </Button>
        ))}
      </ButtonGroup>
    </div>
  )
}
