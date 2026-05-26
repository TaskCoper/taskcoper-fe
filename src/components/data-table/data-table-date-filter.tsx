import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Separator } from '@/components/ui/separator'
import { useDateFormat } from '@/lib/date'
import type { Column } from '@tanstack/react-table'
import { endOfDay, startOfDay } from 'date-fns'
import { CalendarIcon, XCircle } from 'lucide-react'
import * as React from 'react'
import type { DateRange } from 'react-day-picker'
import { useTranslation } from 'react-i18next'

type DateSelection = Date[] | DateRange

function getIsDateRange(value: DateSelection): value is DateRange {
  return value && typeof value === 'object' && !Array.isArray(value)
}

function parseAsDate(value: number | string | undefined): Date | undefined {
  if (!value) return undefined
  // Handle both ISO strings and numeric timestamps
  const date = new Date(value)
  return !Number.isNaN(date.getTime()) ? date : undefined
}

function parseColumnFilterValue(value: unknown) {
  if (value === null || value === undefined) {
    return []
  }

  if (Array.isArray(value)) {
    return value.map((item) => {
      if (typeof item === 'number' || typeof item === 'string') {
        return item
      }
      return undefined
    })
  }

  if (typeof value === 'string' || typeof value === 'number') {
    return [value]
  }

  return []
}

interface DataTableDateFilterProps<TData> {
  column: Column<TData, unknown>
  title?: string
  multiple?: boolean
}

export function DataTableDateFilter<TData>({ column, title, multiple }: DataTableDateFilterProps<TData>) {
  const { t } = useTranslation()
  const { formatDate } = useDateFormat()
  const columnFilterValue = column.getFilterValue()

  const selectedDates = React.useMemo<DateSelection>(() => {
    if (!columnFilterValue) {
      return multiple ? { from: undefined, to: undefined } : []
    }

    if (multiple) {
      const timestamps = parseColumnFilterValue(columnFilterValue)
      return {
        from: parseAsDate(timestamps[0]),
        to: parseAsDate(timestamps[1])
      }
    }

    const timestamps = parseColumnFilterValue(columnFilterValue)
    const date = parseAsDate(timestamps[0])
    return date ? [date] : []
  }, [columnFilterValue, multiple])

  const onSelect = React.useCallback(
    (date: Date | DateRange | undefined) => {
      if (!date) {
        column.setFilterValue(undefined)
        return
      }

      if (multiple && !('getTime' in date)) {
        const from = date.from ? startOfDay(date.from).toISOString() : undefined
        const to = date.to ? endOfDay(date.to).toISOString() : undefined
        column.setFilterValue(from || to ? [from, to] : undefined)
      } else if (!multiple && 'getTime' in date) {
        column.setFilterValue(date.toISOString())
      }
    },
    [column, multiple]
  )

  const onReset = React.useCallback(
    (event: React.MouseEvent) => {
      event.stopPropagation()
      column.setFilterValue(undefined)
    },
    [column]
  )

  const hasValue = React.useMemo(() => {
    if (multiple) {
      if (!getIsDateRange(selectedDates)) return false
      return selectedDates.from || selectedDates.to
    }
    if (!Array.isArray(selectedDates)) return false
    return selectedDates.length > 0
  }, [multiple, selectedDates])

  const formatDateRange = React.useCallback(
    (range: DateRange) => {
      if (!range.from && !range.to) return ''
      if (range.from && range.to) {
        return `${formatDate(range.from, 'dateMedium')} - ${formatDate(range.to, 'dateMedium')}`
      }
      return formatDate(range.from ?? range.to, 'dateMedium')
    },
    [formatDate]
  )

  const label = React.useMemo(() => {
    if (multiple) {
      if (!getIsDateRange(selectedDates)) return null

      const hasSelectedDates = selectedDates.from || selectedDates.to
      const dateText = hasSelectedDates ? formatDateRange(selectedDates) : t('dataTable.filter.selectDateRange')

      return (
        <span className='flex items-center gap-2'>
          <span>{title}</span>
          {hasSelectedDates && (
            <>
              <Separator orientation='vertical' className='mx-0.5 data-[orientation=vertical]:h-4' />
              <p className='text-xs text-white font-medium bg-primary px-2 py-0.5 rounded-sm'>{dateText}</p>
            </>
          )}
        </span>
      )
    }

    if (getIsDateRange(selectedDates)) return null

    const hasSelectedDate = selectedDates.length > 0
    const dateText = hasSelectedDate ? formatDate(selectedDates[0], 'dateMedium') : t('dataTable.filter.selectDate')

    return (
      <span className='flex items-center gap-2'>
        <span>{title}</span>
        {hasSelectedDate && (
          <>
            <Separator orientation='vertical' className='mx-0.5 data-[orientation=vertical]:h-4' />
            <span>{dateText}</span>
          </>
        )}
      </span>
    )
  }, [selectedDates, multiple, formatDateRange, title, t, formatDate])

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant='outline' size='sm' className='border-dashed font-normal'>
          {hasValue ? (
            <div
              role='button'
              aria-label={`Clear ${title} filter`}
              tabIndex={0}
              onClick={onReset}
              className='rounded-sm opacity-70 transition-opacity hover:opacity-100 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring'
            >
              <XCircle />
            </div>
          ) : (
            <CalendarIcon />
          )}
          {label}
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-auto p-0' align='start'>
        {multiple ? (
          <Calendar
            autoFocus
            captionLayout='dropdown'
            mode='range'
            selected={getIsDateRange(selectedDates) ? selectedDates : { from: undefined, to: undefined }}
            onSelect={onSelect}
          />
        ) : (
          <Calendar
            captionLayout='dropdown'
            mode='single'
            selected={!getIsDateRange(selectedDates) ? selectedDates[0] : undefined}
            onSelect={onSelect}
          />
        )}
      </PopoverContent>
    </Popover>
  )
}
