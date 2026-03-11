import { DatePickerField } from '@/components/date-picker-field'
import { DayOfWeekField } from '@/components/day-of-week-field'
import { TimeInputField } from '@/components/time-input-field'
import { Field, FieldContent, FieldDescription, FieldError, FieldLabel } from '@/components/ui/field'
import { Switch } from '@/components/ui/switch'
import { Controller, useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import type { CreateSchedulesFormValues } from '../validations'

export default function CreateSchedulesForm() {
  const { t } = useTranslation()
  const { control } = useFormContext<CreateSchedulesFormValues>()

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

      <Controller
        name='isActive'
        control={control}
        render={({ field, fieldState }) => (
          <Field
            orientation='horizontal'
            data-invalid={fieldState.invalid}
            className='p-4 bg-muted/80 rounded-md border border-dashed'
          >
            <FieldContent className='gap-0'>
              <FieldLabel htmlFor={field.name}>{t('schedule.field.isActive')}</FieldLabel>
              <FieldDescription className='text-xs'>{t('schedule.field.isActiveDescription')}</FieldDescription>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </FieldContent>

            <Switch
              id={field.name}
              name={field.name}
              checked={field.value}
              onCheckedChange={field.onChange}
              aria-invalid={fieldState.invalid}
            />
          </Field>
        )}
      />
    </div>
  )
}
