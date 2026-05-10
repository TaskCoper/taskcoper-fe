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
import { endOfMonth, endOfYear, format, getYear, startOfMonth, startOfYear } from 'date-fns'
import { MoreHorizontalIcon } from 'lucide-react'
import { useState } from 'react'
import { useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import type { ProjectTaskStatisticsParams } from '../validations'

const currentYear = getYear(new Date())
const YEAR_OPTIONS = Array.from({ length: 5 }, (_, i) => currentYear - i)

interface ProjectTaskStatsPopoverProps {
  // parentMilestones: ParentMilestone[]
  onApplyFilters: (data: ProjectTaskStatisticsParams) => void
}

export default function ProjectTaskStatsPopover({ onApplyFilters }: ProjectTaskStatsPopoverProps) {
  const { t } = useTranslation()
  const { setValue, getValues, handleSubmit } = useFormContext<ProjectTaskStatisticsParams>()

  const handleApply = handleSubmit((data) => {
    onApplyFilters(data)
    setIsOpenBarChartPopover(false)
  })

  const [isOpenBarChartPopover, setIsOpenBarChartPopover] = useState(false)
  const [selectedYear, setSelectedYear] = useState<number>(() => {
    const fromVal = getValues('from')
    if (fromVal) {
      return getYear(new Date(fromVal))
    }
    return currentYear
  })

  const [selectedMonth, setSelectedMonth] = useState<number>(() => {
    const fromVal = getValues('from')
    if (fromVal && !getValues('isViewInMonth')) {
      return new Date(fromVal).getMonth()
    }
    return new Date().getMonth()
  })

  const handleTabChange = (value: 'weeks' | 'months') => {
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
    <Popover open={isOpenBarChartPopover} onOpenChange={setIsOpenBarChartPopover}>
      <PopoverTrigger asChild>
        <Button variant='ghost' size='icon-sm' className={isOpenBarChartPopover ? 'bg-primary/10 text-primary' : ''}>
          <MoreHorizontalIcon />
        </Button>
      </PopoverTrigger>
      <PopoverContent sideOffset={8} align='end'>
        <form onSubmit={handleApply} className='space-y-4'>
          <PopoverHeader className='gap-0'>
            <PopoverTitle>{t('common.ui.action')}</PopoverTitle>
            <PopoverDescription className='text-xs'>
              {t('projectPerformance.popover.actionDescription')}
            </PopoverDescription>
          </PopoverHeader>

          <Tabs
            defaultValue={getValues('isViewInMonth') ? 'months' : 'weeks'}
            onValueChange={(value) => handleTabChange(value as 'weeks' | 'months')}
          >
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

                {/* <Controller
                  name='parentMilestoneId'
                  control={control}
                  render={({ field, fieldState }) => (
                    <Field orientation='responsive' data-invalid={fieldState.invalid} className='gap-1 w-full'>
                      <FieldLabel htmlFor={field.name} className='gap-1 items-baseline'>
                        {t('projectPerformance.popover.tab')}
                        <span className='text-muted-foreground text-xs'>({t('common.ui.optional')})</span>
                      </FieldLabel>

                      <Select name={field.name} value={field.value ?? undefined} onValueChange={field.onChange}>
                        <SelectTrigger id={field.name} aria-invalid={fieldState.invalid}>
                          <SelectValue placeholder={t('common.ui.selectPlaceholder')} />
                        </SelectTrigger>
                        <SelectContent>
                          {parentMilestones.map((milestone) => (
                            <SelectItem key={milestone.id} value={milestone.id}>
                              {milestone.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </Field>
                  )}
                /> */}
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

                {/* <Controller
                  name='parentMilestoneId'
                  control={control}
                  render={({ field, fieldState }) => (
                    <Field orientation='responsive' data-invalid={fieldState.invalid} className='gap-1 w-full'>
                      <FieldLabel htmlFor={field.name} className='gap-1 items-baseline'>
                        {t('projectPerformance.popover.tab')}
                        <span className='text-muted-foreground text-xs'>({t('common.ui.optional')})</span>
                      </FieldLabel>

                      <Select name={field.name} value={field.value ?? undefined} onValueChange={field.onChange}>
                        <SelectTrigger id={field.name} aria-invalid={fieldState.invalid}>
                          <SelectValue placeholder={t('common.ui.selectPlaceholder')} />
                        </SelectTrigger>
                        <SelectContent>
                          {parentMilestones.map((milestone) => (
                            <SelectItem key={milestone.id} value={milestone.id}>
                              {milestone.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </Field>
                  )}
                /> */}
              </div>
            </TabsContent>
          </Tabs>

          <Button type='submit' className='w-full'>
            {t('common.ui.apply')}
          </Button>
        </form>
      </PopoverContent>
    </Popover>
  )
}
