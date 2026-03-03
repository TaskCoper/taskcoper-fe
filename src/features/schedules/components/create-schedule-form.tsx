import { DatePickerField } from '@/components/date-picker-field'
import { DayOfWeekField } from '@/components/day-of-week-field'
import { TimeInputField } from '@/components/time-input-field'

export default function CreateScheduleForm() {
  return (
    <div className='space-y-4'>
      <DayOfWeekField name='dayOfWeeks' label='schedule.field.availableDays' isRequired />

      <div className='flex items-center gap-4'>
        <TimeInputField name='startTime' label='schedule.field.startTime' isRequired />
        <TimeInputField name='endTime' label='schedule.field.endTime' isRequired />
      </div>

      <div className='flex items-center gap-4'>
        <DatePickerField
          name='activeFrom'
          label='projectPerformance.popover.from'
          placeholder='projectPerformance.popover.selectDate'
          displayError={false}
        />

        <DatePickerField
          name='activeTo'
          label='projectPerformance.popover.to'
          placeholder='projectPerformance.popover.selectDate'
          displayError={false}
        />
      </div>
    </div>
  )
}
