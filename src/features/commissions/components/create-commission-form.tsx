import { Field, FieldContent, FieldDescription, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { MentorTitle, MentorTitleLabel } from '@/features/mentor-applications/types'
import { Controller, useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { CommissionTargetModel, CommissionTargetModelLabel } from '../types'
import type { CreateCommissionFormValues } from '../validations'

export default function CreateCommissionForm() {
  const { t } = useTranslation()
  const { control } = useFormContext<CreateCommissionFormValues>()

  return (
    <div className='space-y-4'>
      <div className='grid grid-cols-2 gap-4'>
        <Controller
          name='targetModel'
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid} className='gap-1'>
              <FieldLabel htmlFor={field.name} className='gap-0.5'>
                {t('commission.field.targetModel')}
                <span className='text-destructive font-semibold'>*</span>
              </FieldLabel>

              <Select name={field.name} value={field.value} onValueChange={field.onChange}>
                <SelectTrigger id={field.name} aria-invalid={fieldState.invalid}>
                  <SelectValue placeholder={t('common.ui.selectPlaceholder')} />
                </SelectTrigger>
                <SelectContent className='min-w-(--radix-select-trigger-width)'>
                  {Object.values(CommissionTargetModel).map((targetModel) => (
                    <SelectItem key={targetModel} value={targetModel}>
                      {CommissionTargetModelLabel[targetModel]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          )}
        />

        <Controller
          name='titleLevel'
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid} className='gap-1'>
              <FieldLabel htmlFor={field.name} className='gap-0.5'>
                {t('commission.field.titleLevel')}
                <span className='text-destructive font-semibold'>*</span>
              </FieldLabel>

              <Select name={field.name} value={field.value} onValueChange={field.onChange}>
                <SelectTrigger id={field.name} aria-invalid={fieldState.invalid}>
                  <SelectValue placeholder={t('common.ui.selectPlaceholder')} />
                </SelectTrigger>
                <SelectContent className='min-w-(--radix-select-trigger-width)'>
                  {Object.values(MentorTitle).map((title) => (
                    <SelectItem key={title} value={title}>
                      {t(MentorTitleLabel[title])}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          )}
        />
      </div>

      <Controller
        name='rate'
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid} className='gap-1'>
            <FieldLabel htmlFor={field.name} className='gap-0.5'>
              {t('commission.field.rate')}
              <span className='text-destructive font-semibold'>*</span>
            </FieldLabel>

            <Input
              {...field}
              id={field.name}
              type='number'
              value={field.value ?? ''}
              min={0}
              max={100}
              aria-invalid={fieldState.invalid}
              placeholder={t('commission.field.rate')}
              onChange={(e) => {
                const val = e.target.value
                field.onChange(val === '' ? undefined : Number(val))
              }}
            />
          </Field>
        )}
      />

      <div className='grid grid-cols-2 gap-4'>
        <Controller
          name='minAmount'
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid} className='gap-1'>
              <FieldLabel htmlFor={field.name} className='gap-0.5'>
                {t('commission.field.minAmount')}
                <span className='text-destructive font-semibold'>*</span>
              </FieldLabel>

              <Input
                {...field}
                id={field.name}
                type='number'
                value={field.value ?? ''}
                min={0}
                aria-invalid={fieldState.invalid}
                placeholder={t('commission.field.minAmount')}
                onChange={(e) => {
                  const val = e.target.value
                  field.onChange(val === '' ? undefined : Number(val))
                }}
              />
            </Field>
          )}
        />

        <Controller
          name='maxAmount'
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid} className='gap-1'>
              <FieldLabel htmlFor={field.name} className='gap-0.5'>
                {t('commission.field.maxAmount')}
                <span className='text-destructive font-semibold'>*</span>
              </FieldLabel>

              <Input
                {...field}
                id={field.name}
                type='number'
                value={field.value ?? ''}
                min={0}
                aria-invalid={fieldState.invalid}
                placeholder={t('commission.field.maxAmount')}
                onChange={(e) => {
                  const val = e.target.value
                  field.onChange(val === '' ? undefined : Number(val))
                }}
              />
            </Field>
          )}
        />
      </div>

      <Controller
        name='isActive'
        control={control}
        render={({ field, fieldState }) => (
          <Field
            orientation='horizontal'
            data-invalid={fieldState.invalid}
            className='p-3 bg-muted/80 rounded-md border border-dashed'
          >
            <FieldContent className='gap-0'>
              <FieldLabel htmlFor={field.name}>{t('common.field.isActive')}</FieldLabel>
              <FieldDescription className='text-xs'>{t('commission.field.isActiveDescription')}</FieldDescription>
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
