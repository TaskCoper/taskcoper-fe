import { DatePickerField } from '@/components/date-picker-field'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger
} from '@/components/ui/popover'
import { zodResolver } from '@hookform/resolvers/zod'
import { MoreHorizontalIcon } from 'lucide-react'
import { useState } from 'react'
import { FormProvider, useForm, useWatch } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { chartDateFilterSchema, type ChartDateFilterParams } from '../validations'

interface ChartDateFilterPopoverProps {
  from: string
  to: string
  onApplyFilters: (data: ChartDateFilterParams) => void
}

export default function ChartDateFilterPopover({ from, to, onApplyFilters }: ChartDateFilterPopoverProps) {
  const { t } = useTranslation()
  const [isOpenPopover, setIsOpenPopover] = useState(false)

  const methods = useForm<ChartDateFilterParams>({
    resolver: zodResolver(chartDateFilterSchema),
    defaultValues: {
      from,
      to
    }
  })

  const handleApply = methods.handleSubmit((data) => {
    onApplyFilters(data)
    setIsOpenPopover(false)
  })

  const handleOpenChange = (open: boolean) => {
    setIsOpenPopover(open)
    if (open) {
      methods.reset({ from, to })
    }
  }

  const fromDate = useWatch({ control: methods.control, name: 'from' })

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

            <div className='space-y-2'>
              <DatePickerField
                name='from'
                label='projectPerformance.popover.from'
                placeholder='projectPerformance.popover.selectDate'
                isRequired
                displayError={false}
              />

              <DatePickerField
                name='to'
                label='projectPerformance.popover.to'
                placeholder='projectPerformance.popover.selectDate'
                isRequired
                minDate={fromDate ? new Date(fromDate) : undefined}
                displayError={false}
              />
            </div>

            <Button type='submit' className='w-full'>
              {t('common.ui.apply')}
            </Button>
          </form>
        </FormProvider>
      </PopoverContent>
    </Popover>
  )
}
