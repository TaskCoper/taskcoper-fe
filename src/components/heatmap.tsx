import { Calendar } from '@/components/ui/calendar'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/shared/utils'
import { subMonths } from 'date-fns'
import React, { createContext, useContext, useMemo } from 'react'
import type { Day } from 'react-day-picker'
import { useTranslation } from 'react-i18next'
import { Card } from './ui/card'

const DAY_SIZE = '13.5px'
const DAY_MARGIN = '0.5px'

export interface CalendarHeatmapData<T = unknown> {
  date: Date
  count: number
  raw?: T
}

type RenderTooltipFn<T> = (data: CalendarHeatmapData<T>, date: Date) => React.ReactNode

interface CalendarHeatmapProps<T = unknown> {
  data?: CalendarHeatmapData<T>[]
  renderTooltip?: RenderTooltipFn<T>
  onDayClick?: (data: CalendarHeatmapData<T>, date: Date) => void
  startMonth?: Date
}

interface HeatmapContextValue<T = unknown> {
  dataMap: Map<string, CalendarHeatmapData<T>>
  renderTooltip?: RenderTooltipFn<T>
  onDayClick?: (data: CalendarHeatmapData<T>, date: Date) => void
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const HeatmapDataContext = createContext<HeatmapContextValue<any>>({ dataMap: new Map() })

const heatmapClassNames = {
  zero: 'bg-muted',
  one: 'bg-green-200/80',
  two: 'bg-green-400/80',
  three: 'bg-green-600/80',
  four: 'bg-green-800/80'
}

function HeatmapDayButton({ day, modifiers, className, ...props }: React.ComponentProps<typeof Day>) {
  void modifiers
  const { t } = useTranslation()
  const { dataMap, renderTooltip, onDayClick } = useContext(HeatmapDataContext)
  const matchingData = dataMap.get(day.date.toDateString())

  const handleClick = () => {
    if (matchingData && onDayClick) {
      onDayClick(matchingData, day.date)
    }
  }

  const countDisplay =
    matchingData?.count !== undefined && matchingData?.count !== null
      ? String(matchingData.count)
      : t('projectPerformance.heatmap.tooltipNoCount')
  const tooltipContent =
    renderTooltip && matchingData
      ? renderTooltip(matchingData, day.date)
      : // interpolation object type varies by i18n version
        (t as (key: string, options?: Record<string, string>) => string)('projectPerformance.heatmap.tooltipDefault', {
          count: countDisplay,
          date: day.date.toDateString()
        })

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <td className={className} {...props} onClick={handleClick} />
      </TooltipTrigger>
      <TooltipContent>{tooltipContent}</TooltipContent>
    </Tooltip>
  )
}

function HeatmapLegend() {
  const { t } = useTranslation()
  const legendItems = [
    { className: heatmapClassNames.zero, label: t('projectPerformance.heatmap.legendZero') },
    { className: heatmapClassNames.one, label: t('projectPerformance.heatmap.legendOneToNine') },
    { className: heatmapClassNames.two, label: t('projectPerformance.heatmap.legendTenToNineteen') },
    { className: heatmapClassNames.three, label: t('projectPerformance.heatmap.legendTwentyToTwentyNine') },
    { className: heatmapClassNames.four, label: t('projectPerformance.heatmap.legendThirtyPlus') }
  ]
  return (
    <TooltipProvider delayDuration={100}>
      <div className='flex space-x-2'>
        <p className='text-muted-foreground text-sm'>{t('projectPerformance.heatmap.less')}</p>
        <div className='flex items-center space-x-1'>
          {legendItems.map((item) => (
            <Tooltip key={item.label}>
              <TooltipTrigger asChild>
                <div className={cn('w-(--box-size) h-(--box-size) rounded-xs cursor-default', item.className)} />
              </TooltipTrigger>
              <TooltipContent>{item.label}</TooltipContent>
            </Tooltip>
          ))}
        </div>
        <p className='text-muted-foreground text-sm'>{t('projectPerformance.heatmap.more')}</p>
      </div>
    </TooltipProvider>
  )
}

function Heatmap<T = unknown>({ data = [], renderTooltip, onDayClick, startMonth }: CalendarHeatmapProps<T>) {
  const defaultStartMonth = startMonth ?? subMonths(new Date(), 11)

  const dataMap = useMemo(() => {
    const map = new Map<string, CalendarHeatmapData<T>>()
    for (const item of data) {
      map.set(item.date.toDateString(), item)
    }
    return map
  }, [data])

  const heatmapModifiers = useMemo(() => {
    const one: Date[] = []
    const two: Date[] = []
    const three: Date[] = []
    const four: Date[] = []

    const activeDates = new Set<string>()

    for (const item of data) {
      const dateStr = item.date.toDateString()

      if (item.count >= 1 && item.count < 10) {
        one.push(item.date)
        activeDates.add(dateStr)
      } else if (item.count >= 10 && item.count < 20) {
        two.push(item.date)
        activeDates.add(dateStr)
      } else if (item.count >= 20 && item.count < 30) {
        three.push(item.date)
        activeDates.add(dateStr)
      } else if (item.count >= 30) {
        four.push(item.date)
        activeDates.add(dateStr)
      }
    }

    const zero = (date: Date) => {
      return !activeDates.has(date.toDateString())
    }

    return { zero, one, two, three, four }
  }, [data])

  const formatCaption = (date: Date) => {
    return date.toLocaleString('default', { month: 'short' })
  }

  return (
    <HeatmapDataContext.Provider value={{ dataMap, renderTooltip, onDayClick } as HeatmapContextValue}>
      <Card
        className='overflow-x-auto shadow-none pt-6 pb-4'
        style={{ '--box-size': DAY_SIZE, '--box-margin': DAY_MARGIN } as React.CSSProperties}
      >
        <div className='flex flex-col gap-3 items-center'>
          <Calendar
            formatters={{ formatCaption }}
            numberOfMonths={12}
            month={defaultStartMonth}
            showOutsideDays={false}
            className='justify-center items-center py-0'
            classNames={{
              nav: 'hidden',
              months: 'flex',
              month_caption: 'text-xs mb-1.5',
              caption_label: 'font-medium',
              month: '!ml-0',
              weekdays: 'hidden',
              weeks: 'flex',
              week: 'select-none flex flex-col',
              day: 'w-(--box-size) h-(--box-size) m-(--box-margin) rounded-xs text-xs text-transparent p-0 cursor-pointer',
              day_button: 'w-full h-full cursor-default bg-transparent p-0 border-none outline-none text-transparent'
            }}
            modifiers={heatmapModifiers}
            modifiersClassNames={{
              ...heatmapClassNames
            }}
            components={{
              Day: HeatmapDayButton
            }}
          />

          <div className='mx-auto'>
            <HeatmapLegend />
          </div>
        </div>
      </Card>
    </HeatmapDataContext.Provider>
  )
}

export default React.memo(Heatmap) as typeof Heatmap
