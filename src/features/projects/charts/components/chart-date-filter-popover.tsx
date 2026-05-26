import { Button } from '@/components/ui/button'
import { Field, FieldLabel } from '@/components/ui/field'
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger
} from '@/components/ui/popover'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { zodResolver } from '@hookform/resolvers/zod'
import { endOfMonth, endOfYear, format, getYear, startOfMonth, startOfYear } from 'date-fns'
import { MoreHorizontalIcon } from 'lucide-react'
import { useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { chartDateFilterSchema, type ChartDateFilterParams } from '../validations'

const currentYear = getYear(new Date())
const YEAR_OPTIONS = Array.from({ length: 5 }, (_, i) => currentYear - i)

interface ChartDateFilterPopoverProps {
  from: string
  to: string
  isViewInMonth?: boolean
  onApplyFilters: (data: ChartDateFilterParams) => void
}

export default function ChartDateFilterPopover({
  from,
  to,
  isViewInMonth = false,
  onApplyFilters
}: ChartDateFilterPopoverProps) {
  const { t } = useTranslation()
  const [isOpenPopover, setIsOpenPopover] = useState(false)

  const methods = useForm<ChartDateFilterParams>({
    resolver: zodResolver(chartDateFilterSchema(t)),
    defaultValues: {
      from,
      to,
      isViewInMonth
    }
  })

  const { setValue, getValues, handleSubmit } = methods

  const [selectedYear, setSelectedYear] = useState<number>(() => {
    if (from) return getYear(new Date(from))
    return currentYear
  })

  const [activeTab, setActiveTab] = useState<'weeks' | 'months'>(isViewInMonth ? 'months' : 'weeks')

  const [selectedMonth, setSelectedMonth] = useState<number>(() => {
    if (from && !isViewInMonth) return new Date(from).getMonth()
    return new Date().getMonth()
  })

  const handleApply = handleSubmit((data) => {
    onApplyFilters(data)
    setIsOpenPopover(false)
  })

  const handleOpenChange = (open: boolean) => {
    setIsOpenPopover(open)
    if (open) {
      methods.reset({ from, to, isViewInMonth })
      setActiveTab(isViewInMonth ? 'months' : 'weeks')
    }
  }

  const handleTabChange = (value: 'weeks' | 'months') => {
    setActiveTab(value)
    setValue('isViewInMonth', value === 'months')
    if (value === 'months') {
      setValue('from', startOfYear(new Date(selectedYear, 0, 1)).toISOString())
      setValue('to', endOfYear(new Date(selectedYear, 0, 1)).toISOString())
    } else {
      setValue('from', startOfMonth(new Date(selectedYear, selectedMonth, 1)).toISOString())
      setValue('to', endOfMonth(new Date(selectedYear, selectedMonth, 1)).toISOString())
    }
  }

  const handleYearChange = (yearStr: string) => {
    const year = parseInt(yearStr, 10)
    setSelectedYear(year)
    const isMonthsTab = getValues('isViewInMonth')
    if (isMonthsTab) {
      setValue('from', startOfYear(new Date(year, 0, 1)).toISOString())
      setValue('to', endOfYear(new Date(year, 0, 1)).toISOString())
    } else {
      setValue('from', startOfMonth(new Date(year, selectedMonth, 1)).toISOString())
      setValue('to', endOfMonth(new Date(year, selectedMonth, 1)).toISOString())
    }
  }

  const handleMonthChange = (monthStr: string) => {
    const month = parseInt(monthStr, 10)
    setSelectedMonth(month)
    setValue('from', startOfMonth(new Date(selectedYear, month, 1)).toISOString())
    setValue('to', endOfMonth(new Date(selectedYear, month, 1)).toISOString())
  }

  return (
    <Popover open={isOpenPopover} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button variant='ghost' size='icon-sm' className={isOpenPopover ? 'bg-primary/10 text-primary' : ''}>
          <MoreHorizontalIcon />
        </Button>
      </PopoverTrigger>
      <PopoverContent sideOffset={8} align='end'>
        <FormProvider {...methods}>
          <form onSubmit={handleApply} className='space-y-4'>
            <PopoverHeader className='gap-0'>
              <PopoverTitle>{t('common.ui.action')}</PopoverTitle>
              <PopoverDescription className='text-xs'>
                {t('projectPerformance.popover.actionDescription')}
              </PopoverDescription>
            </PopoverHeader>

            <Tabs value={activeTab} onValueChange={(value) => handleTabChange(value as 'weeks' | 'months')}>
              <TabsList className='w-full'>
                <TabsTrigger value='weeks'>{t('projectPerformance.popover.weeks')}</TabsTrigger>
                <TabsTrigger value='months'>{t('projectPerformance.popover.months')}</TabsTrigger>
              </TabsList>

              <TabsContent value='weeks'>
                <div className='space-y-4 pt-4'>
                  <Field orientation='responsive' className='gap-1 w-full'>
                    <FieldLabel className='gap-1 items-baseline'>{t('projectPerformance.popover.months')}</FieldLabel>
                    <Select value={selectedMonth.toString()} onValueChange={handleMonthChange}>
                      <SelectTrigger>
                        <SelectValue placeholder={t('projectPerformance.popover.months')} />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 12 }, (_, i) => i).map((month) => (
                          <SelectItem key={month} value={month.toString()}>
                            {format(new Date(currentYear, month, 1), 'MMMM')}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>

                  <Field orientation='responsive' className='gap-1 w-full'>
                    <FieldLabel className='gap-1 items-baseline'>{t('projectPerformance.popover.year')}</FieldLabel>
                    <Select value={selectedYear.toString()} onValueChange={handleYearChange}>
                      <SelectTrigger>
                        <SelectValue placeholder={t('projectPerformance.popover.selectYear')} />
                      </SelectTrigger>
                      <SelectContent>
                        {YEAR_OPTIONS.map((year) => (
                          <SelectItem key={year} value={year.toString()}>
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                </div>
              </TabsContent>

              <TabsContent value='months'>
                <div className='space-y-4 pt-4'>
                  <Field orientation='responsive' className='gap-1 w-full'>
                    <FieldLabel className='gap-1 items-baseline'>{t('projectPerformance.popover.year')}</FieldLabel>
                    <Select value={selectedYear.toString()} onValueChange={handleYearChange}>
                      <SelectTrigger>
                        <SelectValue placeholder={t('projectPerformance.popover.selectYear')} />
                      </SelectTrigger>
                      <SelectContent>
                        {YEAR_OPTIONS.map((year) => (
                          <SelectItem key={year} value={year.toString()}>
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                </div>
              </TabsContent>
            </Tabs>

            <Button type='submit' className='w-full'>
              {t('common.ui.apply')}
            </Button>
          </form>
        </FormProvider>
      </PopoverContent>
    </Popover>
  )
}
