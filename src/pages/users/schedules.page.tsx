import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import CreateSchedulesDialog from '@/features/schedules/components/create-schedules-dialog'
import UpdateScheduleDialog from '@/features/schedules/components/update-schedule-dialog'
import { useDeleteSchedule } from '@/features/schedules/hooks/use-delete-schedule'
import { useGetMySchedules } from '@/features/schedules/hooks/use-get-my-schedules'
import { useConfirmStore } from '@/lib/zustand/confirm.store'
import { cn } from '@/shared/utils'
import type { MeetingRule } from '@/types/schedule.type'
import { format, parseISO } from 'date-fns'
import { ArrowRightIcon, CalendarClock, CalendarPlusIcon, PencilIcon, Trash2Icon } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

const DISPLAY_ORDER = [1, 2, 3, 4, 5, 6, 0] as const

const DAY_I18N_KEY: Record<number, string> = {
  0: 'schedule.timeline.sunday',
  1: 'schedule.timeline.monday',
  2: 'schedule.timeline.tuesday',
  3: 'schedule.timeline.wednesday',
  4: 'schedule.timeline.thursday',
  5: 'schedule.timeline.friday',
  6: 'schedule.timeline.saturday'
}

const parseTimeToMinutes = (time: string): number => {
  const [h, m] = time.split(':')
  return parseInt(h, 10) * 60 + parseInt(m, 10)
}

const formatTime12h = (time: string): string => {
  const [h, m] = time.split(':')
  const hour = parseInt(h, 10)
  const period = hour >= 12 ? 'PM' : 'AM'
  const display = hour % 12 || 12
  return m === '00' ? `${display} ${period}` : `${display}:${m} ${period}`
}

const isTemporary = (rule: MeetingRule): boolean => {
  return rule.activeFrom !== null || rule.activeTo !== null
}

type ScheduleActivationVariant = 'permanent' | 'fromOnly' | 'toOnly' | 'range'

const getScheduleActivationVariant = (rule: MeetingRule): ScheduleActivationVariant => {
  const hasFrom = rule.activeFrom !== null
  const hasTo = rule.activeTo !== null

  if (!hasFrom && !hasTo) return 'permanent'
  if (hasFrom && hasTo) return 'range'
  if (hasFrom) return 'fromOnly'
  return 'toOnly'
}

const formatDateCompact = (iso: string): string => {
  return format(parseISO(iso), 'MMM d')
}

const formatDuration = (startTime: string, endTime: string): string => {
  const diff = parseTimeToMinutes(endTime) - parseTimeToMinutes(startTime)
  const hours = Math.floor(diff / 60)
  const minutes = diff % 60
  if (minutes === 0) return `${hours}h`
  if (hours === 0) return `${minutes}m`
  return `${hours}h ${minutes}m`
}

const ScheduleRow = ({ schedule }: { schedule: MeetingRule }) => {
  const { t } = useTranslation()
  const { confirm } = useConfirmStore()
  const { deleteSchedule, isDeletingSchedule } = useDeleteSchedule()
  const temporary = isTemporary(schedule)

  const isActive = schedule.isActive ?? true

  const handleDelete = async () => {
    const ok = await confirm({
      title: t('schedule.delete.title'),
      description: t('schedule.delete.description'),
      confirmText: t('common.button.delete'),
      cancelText: t('common.button.cancel'),
      variant: 'destructive'
    })

    if (ok) {
      deleteSchedule({ id: schedule.id })
    }
  }

  const startMin = parseTimeToMinutes(schedule.startTimeUtc)
  const endMin = parseTimeToMinutes(schedule.endTimeUtc)
  const activationVariant = getScheduleActivationVariant(schedule)

  const activationLabelKey =
    activationVariant === 'permanent'
      ? 'schedule.timeline.legend.permanent'
      : activationVariant === 'fromOnly'
        ? 'schedule.timeline.legend.fromOnly'
        : activationVariant === 'toOnly'
          ? 'schedule.timeline.legend.toOnly'
          : 'schedule.timeline.legend.range'

  const dotClass = !isActive
    ? 'bg-slate-300 dark:bg-slate-700 ring-1 ring-inset ring-slate-400/20'
    : activationVariant === 'permanent'
      ? 'bg-blue-500 dark:bg-blue-400'
      : activationVariant === 'fromOnly'
        ? 'bg-emerald-500 dark:bg-emerald-400'
        : activationVariant === 'toOnly'
          ? 'bg-red-500 dark:bg-red-400'
          : 'bg-amber-500 dark:bg-amber-400'

  const barClass = !isActive
    ? 'bg-muted-foreground opacity-50'
    : activationVariant === 'permanent'
      ? 'bg-blue-400 dark:bg-blue-500/60'
      : activationVariant === 'fromOnly'
        ? 'bg-emerald-400 dark:bg-emerald-500/60'
        : activationVariant === 'toOnly'
          ? 'bg-red-400 dark:bg-red-500/60'
          : 'bg-amber-400 dark:bg-amber-500/60'

  return (
    <div
      className={cn('group flex items-center gap-3 px-3 py-2.5 transition-all relative', !isActive && 'bg-muted/40')}
    >
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={cn('size-2 shrink-0 rounded-full transition-colors', dotClass)} />
        </TooltipTrigger>
        <TooltipContent side='left' className='text-xs'>
          {!isActive ? t('common.status.disabled') : t(activationLabelKey)}
        </TooltipContent>
      </Tooltip>

      <div className={cn('flex-1 min-w-0 space-y-1.5 transition-opacity', !isActive && 'opacity-40 grayscale-[0.8]')}>
        <div className='flex items-center gap-2'>
          <p className='text-sm font-medium'>
            {formatTime12h(schedule.startTimeUtc)} – {formatTime12h(schedule.endTimeUtc)}
          </p>
          <p className='text-xs text-muted-foreground'>{formatDuration(schedule.startTimeUtc, schedule.endTimeUtc)}</p>
        </div>

        <div className='h-1.5 rounded-full bg-muted overflow-hidden'>
          <div
            className={cn('h-full rounded-full', barClass)}
            style={{
              marginLeft: `${(startMin / 1440) * 100}%`,
              width: `${((endMin - startMin) / 1440) * 100}%`
            }}
          />
        </div>
      </div>

      <div className='flex items-center gap-2 shrink-0'>
        {!isActive && (
          <p className='text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 px-1.5 py-0.5 border border-muted/50 rounded-sm'>
            {t('common.off')}
          </p>
        )}

        {temporary && isActive && (
          <Badge
            variant='secondary'
            className={cn(
              'rounded-md shrink-0 flex items-center gap-1.5 px-2 py-0.5 text-xs font-semibold',
              activationVariant === 'fromOnly' && 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400',
              activationVariant === 'toOnly' && 'bg-red-500/15 text-red-700 dark:text-red-400',
              activationVariant === 'range' && 'bg-amber-500/15 text-amber-700 dark:text-amber-400'
            )}
          >
            <CalendarClock className='size-3' />
            <div className='flex items-center gap-1'>
              {schedule.activeFrom && formatDateCompact(schedule.activeFrom)}
              {schedule.activeFrom && schedule.activeTo && <ArrowRightIcon className='size-3' />}
              {schedule.activeTo && formatDateCompact(schedule.activeTo)}
            </div>
          </Badge>
        )}
      </div>

      <div className='flex items-center gap-1 shrink-0'>
        <UpdateScheduleDialog schedule={schedule}>
          <Button variant='ghost' size='icon-sm'>
            <PencilIcon className='size-4' />
          </Button>
        </UpdateScheduleDialog>

        <Button
          variant='ghost'
          size='icon-sm'
          className='hover:text-destructive'
          onClick={handleDelete}
          disabled={isDeletingSchedule}
        >
          <Trash2Icon />
        </Button>
      </div>
    </div>
  )
}

interface DaySectionProps {
  dayOfWeek: number
  schedules: MeetingRule[]
  isToday: boolean
}

const DaySection = ({ dayOfWeek, schedules, isToday }: DaySectionProps) => {
  const { t } = useTranslation()

  return (
    <div className={cn('rounded-lg border', isToday && 'ring-2 ring-primary/20 border-primary/30')}>
      <div className={cn('flex items-center gap-2 px-3 py-2 border-b', isToday ? 'bg-primary/5' : 'bg-muted/40')}>
        <span className={cn('text-sm font-semibold', isToday && 'text-primary')}>{t(DAY_I18N_KEY[dayOfWeek])}</span>
        {isToday && <Badge className='h-4 px-1.5 text-[10px]'>{t('schedule.timeline.today')}</Badge>}
      </div>

      {schedules.length > 0 ? (
        <div className='divide-y'>
          {schedules.map((schedule) => (
            <ScheduleRow key={schedule.id} schedule={schedule} />
          ))}
        </div>
      ) : (
        <div className='px-3 py-4 text-center text-xs text-muted-foreground/50'>—</div>
      )}
    </div>
  )
}

const TimelineSkeleton = () => (
  <div className='space-y-4'>
    {Array.from({ length: 5 }).map((_, i) => (
      <div key={i} className='rounded-lg border overflow-hidden'>
        <Skeleton className='h-9 w-full rounded-none' />
        <div className='p-2.5 space-y-2'>
          <Skeleton className='h-10 w-full rounded-md' />
          {i % 2 === 0 && <Skeleton className='h-10 w-full rounded-md' />}
        </div>
      </div>
    ))}
  </div>
)

const TimelineEmpty = () => {
  const { t } = useTranslation()
  return (
    <div className='flex flex-col items-center justify-center py-16 text-center'>
      <div className='rounded-full bg-muted p-4 mb-4'>
        <CalendarClock className='size-8 text-muted-foreground' />
      </div>
      <h3 className='text-lg font-semibold'>{t('schedule.timeline.empty')}</h3>
      <p className='text-sm text-muted-foreground mt-1 max-w-sm'>{t('schedule.timeline.emptyDescription')}</p>
    </div>
  )
}

export default function SchedulesPage() {
  const { t } = useTranslation()
  const [isActiveFilter, setIsActiveFilter] = useState<string>('all')

  const parsedIsActive = isActiveFilter === 'all' ? undefined : isActiveFilter === 'true'
  const { schedules, isLoadingSchedules } = useGetMySchedules({ isActive: parsedIsActive })

  const items = useMemo(() => schedules?.value?.items ?? [], [schedules])

  const dayMap = useMemo(() => {
    const map = new Map<number, MeetingRule[]>()

    for (const item of items) {
      const list = map.get(item.dayOfWeek) ?? []
      list.push(item)
      map.set(item.dayOfWeek, list)
    }

    for (const [, list] of map) {
      list.sort((a, b) => parseTimeToMinutes(a.startTimeUtc) - parseTimeToMinutes(b.startTimeUtc))
    }

    return map
  }, [items])

  const todayDow = new Date().getDay()

  return (
    <div className='flex flex-col h-full overflow-auto pb-14'>
      <div className='flex items-center justify-between px-4 pt-4'>
        <div className='flex flex-wrap items-center gap-3 text-xs text-muted-foreground'>
          <div className='flex items-center gap-1.5'>
            <p className='size-2 rounded-full bg-blue-400 dark:bg-blue-500' />
            <p>{t('schedule.timeline.legend.permanent')}</p>
          </div>
          <div className='flex items-center gap-1.5'>
            <p className='size-2 rounded-full bg-emerald-400 dark:bg-emerald-500' />
            <p>{t('schedule.timeline.legend.fromOnly')}</p>
          </div>
          <div className='flex items-center gap-1.5'>
            <p className='size-2 rounded-full bg-red-400 dark:bg-red-500' />
            <p>{t('schedule.timeline.legend.toOnly')}</p>
          </div>
          <div className='flex items-center gap-1.5'>
            <p className='size-2 rounded-full bg-amber-400 dark:bg-amber-500' />
            <p>{t('schedule.timeline.legend.range')}</p>
          </div>
        </div>

        <div className='flex items-center gap-2'>
          <Select value={isActiveFilter} onValueChange={setIsActiveFilter}>
            <SelectTrigger size='sm'>
              <SelectValue placeholder={t('common.status.all')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>{t('common.status.all')}</SelectItem>
              <SelectItem value='true'>{t('common.status.active')}</SelectItem>
              <SelectItem value='false'>{t('common.status.inactive')}</SelectItem>
            </SelectContent>
          </Select>

          <CreateSchedulesDialog>
            <Button size='sm'>
              <CalendarPlusIcon />
              {t('schedule.button.create')}
            </Button>
          </CreateSchedulesDialog>
        </div>
      </div>

      <ScrollArea className='flex-1'>
        <div className='space-y-4 p-4'>
          {isLoadingSchedules ? (
            <TimelineSkeleton />
          ) : items.length === 0 ? (
            <TimelineEmpty />
          ) : (
            DISPLAY_ORDER.map((dow) => (
              <DaySection key={dow} dayOfWeek={dow} schedules={dayMap.get(dow) ?? []} isToday={dow === todayDow} />
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
