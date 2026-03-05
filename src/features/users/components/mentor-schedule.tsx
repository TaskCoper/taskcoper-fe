import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { cn } from '@/shared/utils'
import { addWeeks, endOfWeek, format, getISOWeek, getYear, startOfWeek, subWeeks } from 'date-fns'
import { vi } from 'date-fns/locale'
import { CalendarDaysIcon, ChevronLeftIcon, ChevronRightIcon } from 'lucide-react'
import { useMemo, useState } from 'react'

type SlotStatus = 'available' | 'booked'

interface ScheduleSlot {
  id: string
  time: string
  status: SlotStatus
  title?: string
}

interface DaySchedule {
  date: Date
  slots: ScheduleSlot[]
}

function generateMockSchedule(weekStart: Date): DaySchedule[] {
  const days: DaySchedule[] = []

  const mockSlots: Record<number, ScheduleSlot[]> = {
    0: [
      { id: '1', time: '08:00 - 09:00', status: 'available', title: 'Tư vấn mở' },
      { id: '2', time: '09:30 - 10:30', status: 'booked', title: 'Đã đặt lịch' },
      { id: '3', time: '11:00 - 12:00', status: 'available', title: 'Tư vấn mở' },
      { id: '4', time: '14:00 - 15:00', status: 'booked', title: 'Đã đặt lịch' },
      { id: '5', time: '16:00 - 17:00', status: 'available', title: 'Tư vấn mở' }
    ],

    1: [
      { id: '6', time: '09:00 - 10:00', status: 'available', title: 'Tư vấn mở' },
      { id: '7', time: '10:30 - 11:30', status: 'booked', title: 'Đã đặt lịch' },
      { id: '8', time: '13:00 - 14:00', status: 'available', title: 'Tư vấn mở' },
      { id: '9', time: '15:00 - 16:00', status: 'booked', title: 'Đã đặt lịch' }
    ],

    2: [
      { id: '10', time: '08:00 - 09:30', status: 'booked', title: 'Đã đặt lịch' },
      { id: '11', time: '10:00 - 11:00', status: 'available', title: 'Tư vấn mở' },
      { id: '12', time: '11:30 - 12:30', status: 'available', title: 'Tư vấn mở' },
      { id: '13', time: '14:00 - 15:00', status: 'booked', title: 'Đã đặt lịch' },
      { id: '14', time: '16:00 - 17:00', status: 'available', title: 'Tư vấn mở' }
    ],

    3: [
      { id: '15', time: '09:00 - 10:00', status: 'available', title: 'Tư vấn mở' },
      { id: '16', time: '10:30 - 11:30', status: 'available', title: 'Tư vấn mở' },
      { id: '17', time: '13:30 - 14:30', status: 'booked', title: 'Đã đặt lịch' }
    ],

    4: [
      { id: '18', time: '08:30 - 09:30', status: 'booked', title: 'Đã đặt lịch' },
      { id: '19', time: '10:00 - 11:00', status: 'available', title: 'Tư vấn mở' },
      { id: '20', time: '11:30 - 12:30', status: 'available', title: 'Tư vấn mở' },
      { id: '21', time: '14:30 - 15:30', status: 'booked', title: 'Đã đặt lịch' },
      { id: '22', time: '16:00 - 17:00', status: 'available', title: 'Tư vấn mở' }
    ],

    5: [
      { id: '23', time: '09:00 - 10:00', status: 'available', title: 'Tư vấn mở' },
      { id: '24', time: '10:30 - 11:30', status: 'available', title: 'Tư vấn mở' },
      { id: '25', time: '13:00 - 14:00', status: 'booked', title: 'Đã đặt lịch' },
      { id: '26', time: '15:00 - 16:00', status: 'available', title: 'Tư vấn mở' }
    ],

    6: [
      { id: '27', time: '10:00 - 11:00', status: 'available', title: 'Tư vấn mở' },
      { id: '28', time: '14:00 - 15:00', status: 'booked', title: 'Đã đặt lịch' }
    ]
  }

  for (let i = 0; i < 7; i++) {
    const date = new Date(weekStart)
    date.setDate(weekStart.getDate() + i)

    days.push({
      date,
      slots: mockSlots[i] || []
    })
  }

  return days
}

const DAY_LABELS = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ Nhật']

export default function MentorSchedule() {
  const today = new Date()
  const [selectedYear, setSelectedYear] = useState<number>(getYear(today))
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(startOfWeek(today, { weekStartsOn: 1 }))

  const currentYear = getYear(today)

  const yearOptions = useMemo(() => {
    return [currentYear - 1, currentYear, currentYear + 1]
  }, [currentYear])

  const weekOptions = useMemo(() => {
    const weeks: { value: string; label: string; start: Date }[] = []
    let weekStart = startOfWeek(new Date(selectedYear, 0, 4), { weekStartsOn: 1 })

    while (getYear(weekStart) <= selectedYear) {
      const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 })
      if (getYear(weekStart) === selectedYear || getYear(weekEnd) === selectedYear) {
        weeks.push({
          value: weekStart.toISOString(),
          label: `${format(weekStart, 'dd/MM')} - ${format(weekEnd, 'dd/MM')}`,
          start: weekStart
        })
      }
      weekStart = addWeeks(weekStart, 1)
      if (weeks.length > 53) break
    }
    return weeks
  }, [selectedYear])

  const schedule = useMemo(() => generateMockSchedule(currentWeekStart), [currentWeekStart])

  const currentWeekLabel = useMemo(() => {
    const weekEnd = endOfWeek(currentWeekStart, { weekStartsOn: 1 })
    return `${format(currentWeekStart, 'dd/MM')} - ${format(weekEnd, 'dd/MM')}`
  }, [currentWeekStart])

  const handlePrevWeek = () => {
    const prev = subWeeks(currentWeekStart, 1)
    setCurrentWeekStart(prev)
    setSelectedYear(getYear(prev))
  }

  const handleNextWeek = () => {
    const next = addWeeks(currentWeekStart, 1)
    setCurrentWeekStart(next)
    setSelectedYear(getYear(next))
  }

  const handleYearChange = (year: string) => {
    const y = parseInt(year)
    setSelectedYear(y)
    const newStart = startOfWeek(new Date(y, 0, 4), { weekStartsOn: 1 })
    setCurrentWeekStart(newStart)
  }

  const handleWeekChange = (isoString: string) => {
    const newStart = new Date(isoString)
    setCurrentWeekStart(newStart)
  }

  const isToday = (date: Date) => {
    const t = new Date()
    return date.getDate() === t.getDate() && date.getMonth() === t.getMonth() && date.getFullYear() === t.getFullYear()
  }

  return (
    <Card className='p-4 shadow-none rounded-lg bg-muted/20 gap-6'>
      <div className='flex items-start justify-between'>
        <div>
          <div className='flex items-center gap-2'>
            <CalendarDaysIcon className='size-4' />
            <p className='text-sm font-medium'>Lịch hẹn </p>
          </div>
          <p className='text-xs text-muted-foreground'>
            Tuần {getISOWeek(currentWeekStart)} - {format(currentWeekStart, 'MMMM yyyy', { locale: vi })}
          </p>
        </div>

        <div className='flex items-center gap-2'>
          <Select value={selectedYear.toString()} onValueChange={handleYearChange}>
            <SelectTrigger className='w-[90px] text-sm bg-background'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent side='bottom' sideOffset={8}>
              {yearOptions.map((y) => (
                <SelectItem key={y} value={y.toString()}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className='flex items-center gap-1'>
            <Button size='icon-sm' variant='outline' onClick={handlePrevWeek}>
              <ChevronLeftIcon className='size-4' />
            </Button>

            <Select value={currentWeekStart.toISOString()} onValueChange={handleWeekChange}>
              <SelectTrigger className='w-[140px] text-sm font-medium bg-background'>
                <SelectValue>{currentWeekLabel}</SelectValue>
              </SelectTrigger>
              <SelectContent
                side='bottom'
                sideOffset={8}
                className='max-h-[calc(var(--radix-select-content-available-height)-8px)]'
              >
                {weekOptions.map((w) => (
                  <SelectItem key={w.value} value={w.value}>
                    {w.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button size='icon-sm' variant='outline' onClick={handleNextWeek}>
              <ChevronRightIcon className='size-4' />
            </Button>
          </div>
        </div>
      </div>

      <div className='grid grid-cols-7 gap-2'>
        {schedule.map((day, index) => {
          const dayIsToday = isToday(day.date)

          return (
            <div key={index} className='flex flex-col gap-2'>
              <div
                className={cn(
                  'text-center rounded-lg py-1 transition-colors border border-border',
                  dayIsToday ? 'bg-primary text-primary-foreground' : 'bg-background/60'
                )}
              >
                <p className='text-xs font-medium'>{DAY_LABELS[index]}</p>
                <p className={cn('text-[10px] font-medium', dayIsToday ? 'text-white' : 'text-muted-foreground')}>
                  ({format(day.date, 'dd/MM')})
                </p>
              </div>

              <div className='space-y-2 min-h-[80px]'>
                {day.slots.length > 0
                  ? day.slots.map((slot) => (
                      <div
                        key={slot.id}
                        className={cn(
                          'border-dashed p-2 rounded-md text-center cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:shadow-sm',
                          slot.status === 'available' &&
                            'bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400',
                          slot.status === 'booked' &&
                            'bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-400'
                        )}
                      >
                        <p className='text-xs font-semibold leading-tight'>{slot.time}</p>
                      </div>
                    ))
                  : null}
              </div>
            </div>
          )
        })}
      </div>

      <div className='flex justify-center items-center gap-4 text-xs'>
        <div className='flex items-center gap-1.5'>
          <div className='size-2.5 rounded-full bg-emerald-500' />
          <span className='text-muted-foreground'>Trống</span>
        </div>
        <div className='flex items-center gap-1.5'>
          <div className='size-2.5 rounded-full bg-rose-500' />
          <span className='text-muted-foreground'>Đã đặt</span>
        </div>
      </div>
    </Card>
  )
}
