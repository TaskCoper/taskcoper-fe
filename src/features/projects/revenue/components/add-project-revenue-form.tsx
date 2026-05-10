import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { InputGroup, InputGroupAddon, InputGroupText, InputGroupTextarea } from '@/components/ui/input-group'
import RevenueLabelCombobox from '@/features/projects/resources/components/revenue-label-combobox'
import { Controller, useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import type { AddProjectRevenueFormValues } from '../validations'

export default function AddProjectRevenueForm() {
  const { t } = useTranslation()
  const { control, watch } = useFormContext<AddProjectRevenueFormValues>()

  const projectIdentifier = watch('projectIdentifier')

  return (
    <div className='space-y-2'>
      <Controller
        name='name'
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid} className='gap-1'>
            <FieldLabel htmlFor={field.name}>{t('project.addProjectRevenue.name.label')}</FieldLabel>
            <Input
              {...field}
              id={field.name}
              aria-invalid={fieldState.invalid}
              placeholder={t('project.addProjectRevenue.name.placeholder')}
              spellCheck={false}
              autoFocus
            />

            <div className='min-h-4'>
              {fieldState.invalid && <FieldError className='text-xs' errors={[fieldState.error]} />}
            </div>
          </Field>
        )}
      />

      <Controller
        name='amount'
        control={control}
        render={({ field: { value, onChange, ...field }, fieldState }) => (
          <Field data-invalid={fieldState.invalid} className='gap-1'>
            <FieldLabel htmlFor={field.name}>{t('project.addProjectRevenue.amount.label')}</FieldLabel>
            <Input
              {...field}
              type='number'
              id={field.name}
              value={value ? value : ''}
              onChange={(e) => {
                const val = e.target.value
                onChange(val === '' ? undefined : Number(val))
              }}
              aria-invalid={fieldState.invalid}
              placeholder={t('project.addProjectRevenue.amount.placeholder')}
              min={1}
            />

            <div className='min-h-4'>
              {fieldState.invalid && <FieldError className='text-xs' errors={[fieldState.error]} />}
            </div>
          </Field>
        )}
      />

      <Controller
        name='labelIds'
        control={control}
        render={({ field }) => (
          <Field className='gap-1 mb-6'>
            <FieldLabel>{t('common.field.label')}</FieldLabel>
            <RevenueLabelCombobox
              projectIdentifier={projectIdentifier}
              selectedLabelIds={field.value}
              onSelectionChange={(labelIds) => field.onChange(labelIds)}
            />
          </Field>
        )}
      />

      <Controller
        name='note'
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid} className='gap-1'>
            <FieldLabel htmlFor={field.name}>{t('project.addProjectRevenue.note.label')}</FieldLabel>
            <InputGroup>
              <InputGroupTextarea
                {...field}
                id={field.name}
                placeholder={t('project.addProjectRevenue.note.placeholder')}
                rows={6}
                className='min-h-24 resize-none wrap-break-word'
                aria-invalid={fieldState.invalid}
              />
              <InputGroupAddon align='block-end'>
                <InputGroupText className='tabular-nums text-xs'>
                  {field.value.length}/255 {t('common.ui.characters')}
                </InputGroupText>
              </InputGroupAddon>
            </InputGroup>
          </Field>
        )}
      />
    </div>
  )
}
