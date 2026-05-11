import RichTextEditor from '@/components/rich-text-editor'
import { Field, FieldContent, FieldDescription, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Controller, useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import type { UpdateMentorPackageFormValues } from '../validations'

export default function UpdateMentorPackageForm() {
  const { t } = useTranslation()
  const { control } = useFormContext<UpdateMentorPackageFormValues>()

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
              spellCheck={false}
            />

            <div className='min-h-4'>
              {fieldState.invalid && <FieldError className='text-xs' errors={[fieldState.error]} />}
            </div>
          </Field>
        )}
      />

      <div className='flex items-center gap-4'>
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

      <div className='flex items-center gap-4'>
        <Controller
          name='activationDeadlineDays'
          control={control}
          render={({ field: { value, onChange, ...field }, fieldState }) => (
            <Field data-invalid={fieldState.invalid} className='gap-1'>
              <FieldLabel htmlFor={field.name}>{t('mentorPackage.form.activationDeadlineDays')}</FieldLabel>
              <Input
                {...field}
                type='number'
                id={field.name}
                value={value ?? ''}
                placeholder={t('mentorPackage.form.activationDeadlineDaysPlaceholder')}
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

        <Controller
          name='usageDeadlineDays'
          control={control}
          render={({ field: { value, onChange, ...field }, fieldState }) => (
            <Field data-invalid={fieldState.invalid} className='gap-1'>
              <FieldLabel htmlFor={field.name}>{t('mentorPackage.form.usageDeadlineDays')}</FieldLabel>
              <Input
                {...field}
                type='number'
                id={field.name}
                value={value ?? ''}
                placeholder={t('mentorPackage.form.usageDeadlineDaysPlaceholder')}
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

      <Controller
        name='description'
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid} className='gap-1'>
            <FieldLabel htmlFor={field.name}>{t('mentorPackage.form.description')}</FieldLabel>
            <RichTextEditor
              content={field.value ?? ''}
              onChange={field.onChange}
              placeholder='mentorPackage.form.descriptionPlaceholder'
              invalid={fieldState.invalid}
              error={fieldState.error}
              compact
            />
          </Field>
        )}
      />

      <Controller
        name='isActive'
        control={control}
        render={({ field, fieldState }) => (
          <Field
            orientation='horizontal'
            data-invalid={fieldState.invalid}
            className='p-4 bg-muted/60 rounded-md border border-dashed'
          >
            <FieldContent className='gap-0'>
              <FieldLabel htmlFor={field.name}>{t('mentorPackage.form.isActive')}</FieldLabel>
              <FieldDescription className='text-xs'>{t('mentorPackage.form.isActiveDescription')}</FieldDescription>
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

      <Controller
        name='isPin'
        control={control}
        render={({ field, fieldState }) => (
          <Field
            orientation='horizontal'
            data-invalid={fieldState.invalid}
            className='p-4 bg-muted/60 rounded-md border border-dashed'
          >
            <FieldContent className='gap-0'>
              <FieldLabel htmlFor={field.name}>{t('mentorPackage.form.isPin')}</FieldLabel>
              <FieldDescription className='text-xs'>{t('mentorPackage.form.isPinDescription')}</FieldDescription>
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
