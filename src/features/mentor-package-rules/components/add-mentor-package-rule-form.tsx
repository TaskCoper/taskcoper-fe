import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Controller, useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import type { AddMentorPackageRuleFormValues } from '../validations'

export default function AddMentorPackageRuleForm() {
  const { t } = useTranslation()
  const { control } = useFormContext<AddMentorPackageRuleFormValues>()

  return (
    <div className='space-y-4'>
      <Controller
        name='no'
        control={control}
        render={({ field: { value, onChange, ...field }, fieldState }) => (
          <Field data-invalid={fieldState.invalid} className='gap-1'>
            <FieldLabel htmlFor={field.name}>{t('mentorPackageRule.form.no')}</FieldLabel>
            <Input
              {...field}
              type='number'
              id={field.name}
              value={value ?? ''}
              placeholder={t('mentorPackageRule.form.noPlaceholder')}
              onChange={(e) => {
                const val = e.target.value
                onChange(val === '' ? undefined : Number(val))
              }}
              aria-invalid={fieldState.invalid}
              autoFocus
            />

            <div className='min-h-4'>
              {fieldState.invalid && <FieldError className='text-xs' errors={[fieldState.error]} />}
            </div>
          </Field>
        )}
      />

      <Controller
        name='totalTimeSlots'
        control={control}
        render={({ field: { value, onChange, ...field }, fieldState }) => (
          <Field data-invalid={fieldState.invalid} className='gap-1'>
            <FieldLabel htmlFor={field.name}>{t('mentorPackageRule.form.totalTimeSlots')}</FieldLabel>
            <Input
              {...field}
              type='number'
              id={field.name}
              value={value ?? ''}
              placeholder={t('mentorPackageRule.form.totalTimeSlotsPlaceholder')}
              onChange={(e) => {
                const val = e.target.value
                onChange(val === '' ? undefined : Number(val))
              }}
              aria-invalid={fieldState.invalid}
            />

            <div className='min-h-4'>
              {fieldState.invalid && <FieldError className='text-xs' errors={[fieldState.error]} />}
            </div>
          </Field>
        )}
      />
    </div>
  )
}
