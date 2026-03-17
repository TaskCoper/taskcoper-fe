import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { InputGroup, InputGroupAddon, InputGroupText, InputGroupTextarea } from '@/components/ui/input-group'
import { Controller, useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import type { CreateMentorPackageFormValues } from '../validations'

export default function CreateMentorPackageForm() {
  const { t } = useTranslation()
  const { control } = useFormContext<CreateMentorPackageFormValues>()

  return (
    <div className='space-y-2'>
      <Controller
        name='name'
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid} className='gap-1'>
            <FieldLabel htmlFor={field.name}>{t('mentorPackage.form.name')}</FieldLabel>
            <Input
              {...field}
              id={field.name}
              placeholder={t('mentorPackage.form.namePlaceholder')}
              aria-invalid={fieldState.invalid}
              autoFocus
              spellCheck={false}
            />

            <div className='min-h-4'>
              {fieldState.invalid && <FieldError className='text-xs' errors={[fieldState.error]} />}
            </div>
          </Field>
        )}
      />

      <div className='flex items-center gap-4'>
        {/* <Controller
          name='durationInMinutes'
          control={control}
          render={({ field: { value, onChange, ...field }, fieldState }) => (
            <Field data-invalid={fieldState.invalid} className='gap-1'>
              <FieldLabel htmlFor={field.name}>{t('mentorPackage.form.durationInMinutes')}</FieldLabel>
              <Input
                {...field}
                type='number'
                id={field.name}
                value={value || ''}
                placeholder={t('mentorPackage.form.durationPlaceholder')}
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
        /> */}

        <Controller
          name='totalSessions'
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid} className='gap-1'>
              <FieldLabel htmlFor={field.name}>{t('mentorPackage.form.totalSessions')}</FieldLabel>
              <Input
                {...field}
                type='text'
                id={field.name}
                value={field.value ?? ''}
                placeholder={t('mentorPackage.form.totalSessionsPlaceholder')}
                aria-invalid={fieldState.invalid}
              />

              <div className='min-h-4'>
                {fieldState.invalid && <FieldError className='text-xs' errors={[fieldState.error]} />}
              </div>
            </Field>
          )}
        />

        <Controller
          name='price'
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid} className='gap-1'>
              <FieldLabel htmlFor={field.name}>{t('mentorPackage.form.price')}</FieldLabel>
              <Input
                {...field}
                type='text'
                id={field.name}
                value={field.value ?? ''}
                placeholder={t('mentorPackage.form.pricePlaceholder')}
                aria-invalid={fieldState.invalid}
              />

              <div className='min-h-4'>
                {fieldState.invalid && <FieldError className='text-xs' errors={[fieldState.error]} />}
              </div>
            </Field>
          )}
        />
      </div>

      {/* <Controller
        name='currency'
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid} className='gap-1'>
            <FieldLabel htmlFor={field.name}>{t('mentorPackage.form.currency')}</FieldLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <SelectTrigger id={field.name}>
                <SelectValue placeholder={t('mentorPackage.form.currencyPlaceholder')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='VND'>VND</SelectItem>
                <SelectItem value='USD'>USD</SelectItem>
              </SelectContent>
            </Select>

            <div className='min-h-4'>
              {fieldState.invalid && <FieldError className='text-xs' errors={[fieldState.error]} />}
            </div>
          </Field>
        )}
      /> */}

      <Controller
        name='description'
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid} className='gap-1'>
            <FieldLabel htmlFor={field.name}>{t('mentorPackage.form.description')}</FieldLabel>
            <InputGroup>
              <InputGroupTextarea
                {...field}
                id={field.name}
                placeholder={t('mentorPackage.form.descriptionPlaceholder')}
                rows={4}
                className='min-h-20 resize-none wrap-break-word'
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
