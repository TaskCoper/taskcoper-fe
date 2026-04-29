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
import { format, isAfter, isBefore, parseISO } from 'date-fns'
import { CalendarClock, CalendarPlusIcon, PencilIcon, Trash2Icon } from 'lucide-react'
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

const ScheduleRow = ({ schedule, onEdit }: { schedule: MeetingRule; onEdit: (schedule: MeetingRule) => void }) => {
  const { t } = useTranslation()
  const { confirm } = useConfirmStore()
  const { deleteSchedule, isDeletingSchedule } = useDeleteSchedule()
  const temporary = isTemporary(schedule)

  const now = new Date()
  let isActive = schedule.isActive ?? true
  let inactiveReason: 'disabled' | 'expired' | 'upcoming' = 'disabled'

  if (isActive) {
    if (schedule.activeFrom && isBefore(now, parseISO(schedule.activeFrom))) {
      isActive = false
      inactiveReason = 'upcoming'
    } else if (schedule.activeTo && isAfter(now, parseISO(schedule.activeTo))) {
      isActive = false
      inactiveReason = 'expired'
    }
  }

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
    ? 'bg-slate-400 dark:bg-slate-600 ring-1 ring-inset ring-slate-400/30'
    : activationVariant === 'permanent'
      ? 'bg-blue-500 dark:bg-blue-400'
      : activationVariant === 'fromOnly'
        ? 'bg-emerald-500 dark:bg-emerald-400'
        : activationVariant === 'toOnly'
          ? 'bg-red-500 dark:bg-red-400'
          : 'bg-amber-500 dark:bg-amber-400'

  return (
    <div
      className={cn('group flex items-center gap-3 px-3 py-2.5 transition-all relative', !isActive && 'bg-muted/40')}
    >
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={cn('size-2 shrink-0 rounded-full transition-colors', dotClass)} />
        </TooltipTrigger>
        <TooltipContent side='left' className='text-xs'>
          {!isActive
            ? inactiveReason === 'expired'
              ? t('schedule.status.expired', 'Expired')
              : inactiveReason === 'upcoming'
                ? t('schedule.status.upcoming', 'Upcoming')
                : t('common.status.disabled')
            : t(activationLabelKey)}
        </TooltipContent>
      </Tooltip>

      <div
        className={cn(
          'flex-1 min-w-0 flex items-center gap-1.5 transition-opacity',
          !isActive && 'opacity-60 grayscale-[0.5]'
        )}
      >
        <p className='text-sm font-medium text-foreground'>
          {formatTime12h(schedule.startTimeUtc)} – {formatTime12h(schedule.endTimeUtc)}
        </p>
        <p className='text-xs font-medium text-muted-foreground'>
          ({formatDuration(schedule.startTimeUtc, schedule.endTimeUtc)})
        </p>
      </div>

      <div className='flex items-center gap-2 shrink-0'>
        {!isActive && inactiveReason === 'disabled' && (
          <p className='text-[10px] font-bold uppercase tracking-widest text-muted-foreground/90 px-1.5 py-0.5 border border-border rounded-sm'>
            {t('common.off')}
          </p>
        )}

        {!isActive && inactiveReason === 'expired' && (
          <div className='flex items-center gap-1.5 px-1.5 py-0.5 border border-destructive/30 rounded-sm bg-destructive/10'>
            <p className='text-[10px] font-bold uppercase tracking-widest text-destructive/90'>
              {t('schedule.status.expired', 'Expired')}
            </p>
            {schedule.activeTo && (
              <span className='text-[10px] font-bold text-destructive'>{formatDateCompact(schedule.activeTo)}</span>
            )}
          </div>
        )}

        {!isActive && inactiveReason === 'upcoming' && (
          <div className='flex items-center gap-1.5 px-1.5 py-0.5 border border-amber-500/30 rounded-sm bg-amber-500/10'>
            <p className='text-[10px] font-bold uppercase tracking-widest text-amber-600 dark:text-amber-500'>
              {t('schedule.status.upcoming', 'Upcoming')}
            </p>
            {schedule.activeFrom && (
              <span className='text-[10px] font-bold text-amber-600 dark:text-amber-500'>
                {formatDateCompact(schedule.activeFrom)}
              </span>
            )}
          </div>
        )}

        {temporary && isActive && (
          <Badge
            variant='secondary'
            className={cn(
              'rounded-md shrink-0 flex items-center gap-1.5 px-2 py-0.5 text-xs font-semibold',
              activationVariant === 'fromOnly' && 'bg-emerald-500/15 text-emerald-800 dark:text-emerald-400',
              activationVariant === 'toOnly' && 'bg-red-500/15 text-red-800 dark:text-red-400',
              activationVariant === 'range' && 'bg-amber-500/15 text-amber-800 dark:text-amber-400'
            )}
          >
            <CalendarClock className='size-3' />
            <div className='flex items-center gap-1.5'>
              {schedule.activeFrom && (
                <div className='flex items-center gap-1'>
                  <span className='opacity-75 font-medium'>{t('schedule.timeline.activeFrom')}</span>
                  <span>{formatDateCompact(schedule.activeFrom)}</span>
                </div>
              )}
              {schedule.activeTo && (
                <div className='flex items-center gap-1'>
                  <span className='opacity-75 font-medium'>{t('schedule.timeline.activeTo')}</span>
                  <span>{formatDateCompact(schedule.activeTo)}</span>
                </div>
              )}
            </div>
          </Badge>
        )}
      </div>

      <div className='flex items-center gap-1 shrink-0'>
        <Button
          variant='ghost'
          size='icon-sm'
          className='text-muted-foreground hover:text-foreground'
          onClick={() => onEdit(schedule)}
        >
          <PencilIcon className='size-4' />
        </Button>

        <Button
          variant='ghost'
          size='icon-sm'
          className='text-muted-foreground hover:text-destructive hover:bg-destructive/10'
          onClick={handleDelete}
          disabled={isDeletingSchedule}
        >
          <Trash2Icon className='size-4' />
        </Button>
      </div>
    </div>
  )
}

interface DaySectionProps {
  dayOfWeek: number
  schedules: MeetingRule[]
  isToday: boolean
  onEdit: (schedule: MeetingRule) => void
}

const DaySection = ({ dayOfWeek, schedules, isToday, onEdit }: DaySectionProps) => {
  const { t } = useTranslation()

  return (
    <div className={cn('rounded-lg border', isToday && 'ring-2 ring-primary/20 border-primary/30')}>
      <div className={cn('flex items-center gap-2 px-3 py-2 border-b', isToday ? 'bg-primary/5' : 'bg-muted/40')}>
        <span className={cn('text-sm font-semibold text-foreground', isToday && 'text-primary')}>
          {t(DAY_I18N_KEY[dayOfWeek])}
        </span>
        {isToday && <Badge className='h-4 px-1.5 text-[10px] font-semibold'>{t('schedule.timeline.today')}</Badge>}
      </div>

      {schedules.length > 0 ? (
        <div className='divide-y divide-border'>
          {schedules.map((schedule) => (
            <ScheduleRow key={schedule.id} schedule={schedule} onEdit={onEdit} />
          ))}
        </div>
      ) : (
        <div className='px-3 py-4 text-center text-xs font-medium text-muted-foreground/70'>—</div>
      )}
    </div>
  )
}

const TimelineSkeleton = () => (
  <div className='space-y-4'>
    {Array.from({ length: 5 }).map((_, i) => (
      <div key={i} className='rounded-lg border overflow-hidden'>
        <Skeleton className='h-9 w-full rounded-none bg-muted/60' />
        <div className='p-2.5 space-y-2'>
          <Skeleton className='h-10 w-full rounded-md bg-muted/40' />
          {i % 2 === 0 && <Skeleton className='h-10 w-full rounded-md bg-muted/40' />}
        </div>
      </div>
    ))}
  </div>
)

const TimelineEmpty = () => {
  const { t } = useTranslation()
  return (
    <div className='flex flex-col items-center justify-center py-16 text-center'>
      <div className='rounded-full bg-muted/60 p-4 mb-4'>
        <CalendarClock className='size-8 text-muted-foreground' />
      </div>
      <h3 className='text-lg font-semibold text-foreground'>{t('schedule.timeline.empty')}</h3>
      <p className='text-sm text-muted-foreground mt-1 max-w-sm'>{t('schedule.timeline.emptyDescription')}</p>
    </div>
  )
}

export default function SchedulesPage() {
  const { t } = useTranslation()
  const [isActiveFilter, setIsActiveFilter] = useState<string>('all')
  const [editingSchedule, setEditingSchedule] = useState<MeetingRule | null>(null)

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
        <div className='flex flex-wrap items-center gap-3 text-xs font-medium text-muted-foreground'>
          <div className='flex items-center gap-1.5'>
            <p className='size-2 rounded-full bg-blue-500 dark:bg-blue-400' />
            <p>{t('schedule.timeline.legend.permanent')}</p>
          </div>
          <div className='flex items-center gap-1.5'>
            <p className='size-2 rounded-full bg-emerald-500 dark:bg-emerald-400' />
            <p>{t('schedule.timeline.legend.fromOnly')}</p>
          </div>
          <div className='flex items-center gap-1.5'>
            <p className='size-2 rounded-full bg-red-500 dark:bg-red-400' />
            <p>{t('schedule.timeline.legend.toOnly')}</p>
          </div>
          <div className='flex items-center gap-1.5'>
            <p className='size-2 rounded-full bg-amber-500 dark:bg-amber-400' />
            <p>{t('schedule.timeline.legend.range')}</p>
          </div>
        </div>

        <div className='flex items-center gap-2'>
          <Select value={isActiveFilter} onValueChange={setIsActiveFilter}>
            <SelectTrigger size='sm' className='font-medium'>
              <SelectValue placeholder={t('common.status.all')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>{t('common.status.all')}</SelectItem>
              <SelectItem value='true'>{t('common.status.active')}</SelectItem>
              <SelectItem value='false'>{t('common.status.inactive')}</SelectItem>
            </SelectContent>
          </Select>

          <CreateSchedulesDialog>
            <Button size='sm' className='font-medium'>
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
              <DaySection
                key={dow}
                dayOfWeek={dow}
                schedules={dayMap.get(dow) ?? []}
                isToday={dow === todayDow}
                onEdit={setEditingSchedule}
              />
            ))
          )}
        </div>
      </ScrollArea>

      <UpdateScheduleDialog
        schedule={editingSchedule}
        open={!!editingSchedule}
        onOpenChange={(open) => !open && setEditingSchedule(null)}
      />
    </div>
  )
}
