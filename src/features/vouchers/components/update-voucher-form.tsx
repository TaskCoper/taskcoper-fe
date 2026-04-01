import { DatePickerField } from '@/components/date-picker-field'
import { Field, FieldContent, FieldDescription, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { InputGroup, InputGroupAddon, InputGroupText, InputGroupTextarea } from '@/components/ui/input-group'
import { Switch } from '@/components/ui/switch'
import { Controller, useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import type { UpdateVoucherFormValues } from '../validations'

export default function UpdateVoucherForm() {
  const { t } = useTranslation()
  const { control } = useFormContext<UpdateVoucherFormValues>()

  return (
    <div className='space-y-1'>
      <Controller
        name='name'
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid} className='gap-1'>
            <FieldLabel htmlFor={field.name} className='gap-0.5'>
              {t('voucher.field.name')}
              <span className='text-destructive font-semibold'>*</span>
            </FieldLabel>

            <Input
              {...field}
              id={field.name}
              aria-invalid={fieldState.invalid}
              placeholder={t('voucher.field.namePlaceholder')}
              autoComplete='off'
              spellCheck={false}
            />

            <div className='min-h-4'>
              {fieldState.invalid && <FieldError className='text-xs' errors={[fieldState.error]} />}
            </div>
          </Field>
        )}
      />

      <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
        <DatePickerField
          control={control}
          name='startsAtUtc'
          label='voucher.field.startsAt'
          placeholder='voucher.field.startsAtPlaceholder'
          isRequired
        />

        <DatePickerField
          control={control}
          name='endsAtUtc'
          label='voucher.field.endsAt'
          placeholder='voucher.field.endsAtPlaceholder'
          isRequired
        />
      </div>

      <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
        <Controller
          name='totalUsageLimit'
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid} className='gap-1'>
              <FieldLabel htmlFor={field.name} className='gap-0.5'>
                {t('voucher.field.totalUsageLimit')}
                <span className='text-destructive font-semibold'>*</span>
              </FieldLabel>

              <Input
                {...field}
                id={field.name}
                value={field.value ?? ''}
                type='number'
                min={1}
                aria-invalid={fieldState.invalid}
                placeholder={t('voucher.field.totalUsageLimitPlaceholder')}
                onChange={(e) => field.onChange(Number(e.target.value))}
              />

              <div className='min-h-4'>
                {fieldState.invalid && <FieldError className='text-xs' errors={[fieldState.error]} />}
              </div>
            </Field>
          )}
        />

        <Controller
          name='usageLimitPerUser'
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid} className='gap-1'>
              <FieldLabel htmlFor={field.name} className='gap-0.5'>
                {t('voucher.field.usageLimitPerUser')}
                <span className='text-destructive font-semibold'>*</span>
              </FieldLabel>

              <Input
                {...field}
                id={field.name}
                value={field.value ?? ''}
                type='number'
                min={1}
                aria-invalid={fieldState.invalid}
                placeholder={t('voucher.field.usageLimitPerUserPlaceholder')}
                onChange={(e) => field.onChange(Number(e.target.value))}
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
            <FieldLabel htmlFor={field.name}>{t('voucher.field.description')}</FieldLabel>
            <InputGroup>
              <InputGroupTextarea
                {...field}
                id={field.name}
                value={field.value ?? ''}
                placeholder={t('voucher.field.descriptionPlaceholder')}
                rows={4}
                className='min-h-20 resize-none wrap-break-word'
                aria-invalid={fieldState.invalid}
              />
              <InputGroupAddon align='block-end'>
                <InputGroupText className='tabular-nums text-xs'>
                  {field.value?.length ?? 0}/255 {t('common.ui.characters')}
                </InputGroupText>
              </InputGroupAddon>
            </InputGroup>
          </Field>
        )}
      />

      <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2'>
        <Controller
          name='isActive'
          control={control}
          render={({ field, fieldState }) => (
            <Field
              orientation='horizontal'
              data-invalid={fieldState.invalid}
              className='p-3 bg-muted/50 rounded-md border border-dashed flex justify-between'
            >
              <FieldContent className='gap-0'>
                <FieldLabel htmlFor={field.name}>{t('voucher.field.isActive')}</FieldLabel>
                <FieldDescription className='text-xs'>{t('voucher.field.isActiveDescription')}</FieldDescription>
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
          name='isStackable'
          control={control}
          render={({ field, fieldState }) => (
            <Field
              orientation='horizontal'
              data-invalid={fieldState.invalid}
              className='p-3 bg-muted/50 rounded-md border border-dashed flex justify-between'
            >
              <FieldContent className='gap-0'>
                <FieldLabel htmlFor={field.name}>{t('voucher.field.isStackable')}</FieldLabel>
                <FieldDescription className='text-xs'>{t('voucher.field.isStackableDescription')}</FieldDescription>
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
    </div>
  )
}
