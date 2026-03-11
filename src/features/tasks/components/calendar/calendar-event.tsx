import { cn } from '@/shared/utils'
import type { TaskPreview } from '@/types/task.type'

interface CalendarEventProps {
  task: TaskPreview
  variant?: 'block' | 'chip'
  style?: React.CSSProperties
  className?: string
  onClick?: (task: TaskPreview) => void
}

const priorityColors: Record<string, string> = {
  HIGHEST: 'bg-rose-500',
  HIGH: 'bg-rose-400',
  MEDIUM: 'bg-orange-400',
  LOW: 'bg-blue-400',
  LOWEST: 'bg-blue-300'
}

const priorityBorderColors: Record<string, string> = {
  HIGHEST: '#f43f5e',
  HIGH: '#fb7185',
  MEDIUM: '#fb923c',
  LOW: '#60a5fa',
  LOWEST: '#93c5fd'
}

const MIN_HEIGHT_FOR_TIME = 32

export default function CalendarEvent({ task, variant = 'block', style, className, onClick }: CalendarEventProps) {
  const accentColor = task.priority ? priorityColors[task.priority] : 'bg-primary'

  if (variant === 'chip') {
    return (
      <div
        className={cn(
          'flex items-center gap-1.5 rounded px-1.5 py-0.5 text-xs truncate cursor-pointer',
          'bg-primary/10 text-primary hover:bg-primary/20 transition-colors',
          className
        )}
        title={task.name}
        onClick={() => onClick?.(task)}
      >
        <span className={cn('size-2 rounded-full shrink-0', accentColor)} />
        <span className='truncate'>{task.name}</span>
      </div>
    )
  }

  const height = typeof style?.height === 'number' ? style.height : 60
  const isCompact = height < MIN_HEIGHT_FOR_TIME

  return (
    <div
      className={cn(
        'absolute rounded-md overflow-hidden cursor-pointer group',
        'bg-primary/10 border-l-[3px] hover:bg-primary/20 transition-colors',
        isCompact ? 'flex items-center px-1.5 gap-1' : 'px-2 py-1',
        className
      )}
      style={{
        borderLeftColor: task.priority ? priorityBorderColors[task.priority] || 'var(--primary)' : 'var(--primary)',
        minHeight: 18,
        ...style
      }}
      title={task.name}
      onClick={() => onClick?.(task)}
    >
      {isCompact ? (
        <>
          <p className='text-[11px] font-medium truncate text-primary leading-none'>{task.name}</p>
        </>
      ) : (
        <>
          <p className='text-xs font-medium truncate text-primary'>{task.name}</p>
          {task.startDate && task.endDate && (
            <p className='text-[10px] text-muted-foreground truncate mt-0.5'>
              {new Date(task.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              {' – '}
              {new Date(task.endDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          )}
        </>
      )}
    </div>
  )
}
