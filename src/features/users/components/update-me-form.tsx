import { ComboboxField } from '@/components/combobox-field'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import DomainMultiSelect from '@/features/mentors/components/domain-multi-select'
import type { Province, Ward } from '@/services/map.service'
import { Controller, useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import type { UpdateMeFormValues } from '../validations'

interface UpdateMeFormProps {
  provinces: Province[]
  wards: Ward[]
  isLoadingProvinces: boolean
  isLoadingWards: boolean
}

export default function UpdateMeForm({ provinces, wards, isLoadingProvinces, isLoadingWards }: UpdateMeFormProps) {
  const { t } = useTranslation()
  const { control, setValue, watch } = useFormContext<UpdateMeFormValues>()

  const cityCodeForm = watch('cityCode')

  return (
    <div className='space-y-6'>
      <div className='space-y-8'>
        <div className='flex items-center gap-4'>
          <Controller
            name='firstName'
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid} className='gap-1 w-full'>
                <FieldLabel htmlFor={field.name} className='gap-0.5'>
                  {t('user.updateProfile.field.firstName.label')}
                  <span className='text-destructive font-semibold'>*</span>
                </FieldLabel>
                <Input
                  {...field}
                  id={field.name}
                  aria-invalid={fieldState.invalid}
                  autoComplete='off'
                  spellCheck={false}
                />
                <div className='min-h-4'>
                  {fieldState.invalid && <FieldError className='text-xs' errors={[fieldState.error]} />}
                </div>
              </Field>
            )}
          />

          <Controller
            name='lastName'
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid} className='gap-1 w-full'>
                <FieldLabel htmlFor={field.name} className='gap-0.5'>
                  {t('user.updateProfile.field.lastName.label')}
                  <span className='text-destructive font-semibold'>*</span>
                </FieldLabel>
                <Input
                  {...field}
                  id={field.name}
                  aria-invalid={fieldState.invalid}
                  autoComplete='off'
                  spellCheck={false}
                />
                <div className='min-h-4'>
                  {fieldState.invalid && <FieldError className='text-xs' errors={[fieldState.error]} />}
                </div>
              </Field>
            )}
          />
        </div>
      </div>

      <div className='space-y-3'>
        <p className='text-lg font-semibold'>{t('user.updateProfile.section.contact')}</p>

        <div>
          <Controller
            name='email'
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid} className='gap-1 w-full'>
                <FieldLabel htmlFor={field.name} className='gap-0.5'>
                  {t('common.field.email')}
                  <span className='text-destructive font-semibold'>*</span>
                </FieldLabel>
                <Input
                  {...field}
                  id={field.name}
                  aria-invalid={fieldState.invalid}
                  autoComplete='off'
                  spellCheck={false}
                />
                <div className='min-h-4'>
                  {fieldState.invalid && <FieldError className='text-xs' errors={[fieldState.error]} />}
                </div>
              </Field>
            )}
          />

          <Controller
            name='phoneNumber'
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid} className='gap-1 w-full'>
                <FieldLabel htmlFor={field.name} className='gap-1 items-baseline'>
                  {t('user.updateProfile.field.phoneNumber.label')}
                  <span className='text-muted-foreground text-xs'>({t('common.ui.optional')})</span>
                </FieldLabel>
                <Input
                  {...field}
                  type='tel'
                  value={field.value ?? ''}
                  id={field.name}
                  aria-invalid={fieldState.invalid}
                  autoComplete='off'
                  spellCheck={false}
                />
                <div className='min-h-4'>
                  {fieldState.invalid && <FieldError className='text-xs' errors={[fieldState.error]} />}
                </div>
              </Field>
            )}
          />
        </div>
      </div>

      <div className='space-y-3'>
        <p className='text-lg font-semibold'>{t('user.updateProfile.section.other')}</p>

        <Controller
          name='domainIds'
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid} className='gap-2 mt-3'>
              <FieldLabel htmlFor={field.name} className='gap-1 items-baseline'>
                {t('user.updateProfile.field.domain.label')}
                <span className='text-muted-foreground text-xs'>({t('common.ui.optional')})</span>
              </FieldLabel>

              <DomainMultiSelect
                value={field.value}
                onChange={(value) => field.onChange(value)}
                placeholder={t('network.filter.domainPlaceholder')}
                maxBadges={6}
              />

              <div className='min-h-4'>
                {fieldState.invalid && <FieldError className='text-xs' errors={[fieldState.error]} />}
              </div>
            </Field>
          )}
        />

        <div>
          <div className='flex items-center gap-4'>
            <ComboboxField
              control={control}
              name='cityCode'
              label='user.updateProfile.field.province.label'
              options={provinces.map((province) => ({
                label: province.name,
                value: String(province.code)
              }))}
              onChange={(value) => {
                // Value get empty string when selected twice
                if (value === '') {
                  setValue('cityCode', -1, { shouldDirty: true })
                  setValue('wardCode', -1, { shouldDirty: true })
                  setValue('state', '', { shouldDirty: true })
                  setValue('city', '', { shouldDirty: true })
                } else {
                  // Selecting a province
                  const newProvinceCode = Number(value)
                  setValue('cityCode', newProvinceCode, { shouldDirty: true })

                  // Set province name
                  const provinceName = provinces.find((province) => province.code === newProvinceCode)?.name
                  if (provinceName) {
                    setValue('city', provinceName, { shouldDirty: true })
                  }

                  // Reset ward and wardCode when selecting a different province
                  if (newProvinceCode !== cityCodeForm) {
                    setValue('wardCode', -1, { shouldDirty: true })
                    setValue('state', '', { shouldDirty: true })
                  }
                }
              }}
              disabled={isLoadingProvinces || provinces.length === 0}
              placeholder='user.updateProfile.field.province.placeholder'
              searchPlaceholder='user.updateProfile.field.province.searchPlaceholder'
              modal
            />

            <ComboboxField
              control={control}
              name='wardCode'
              label='user.updateProfile.field.ward.label'
              options={wards.map((ward) => ({
                label: ward.name,
                value: String(ward.code)
              }))}
              onChange={(value) => {
                // Value get empty string when selected twice
                if (value === '') {
                  setValue('wardCode', -1, { shouldDirty: true })
                  setValue('state', '', { shouldDirty: true })
                } else {
                  setValue('wardCode', Number(value), { shouldDirty: true })
                  const wardName = wards.find((ward) => ward.code === Number(value))?.name
                  if (wardName) {
                    setValue('state', wardName, { shouldDirty: true })
                  }
                }
              }}
              disabled={isLoadingWards || wards.length === 0}
              placeholder='user.updateProfile.field.ward.placeholder'
              searchPlaceholder='user.updateProfile.field.ward.searchPlaceholder'
              modal
            />
          </div>

          <Controller
            name='address'
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid} className='gap-1 w-full'>
                <FieldLabel htmlFor={field.name} className='gap-1 items-baseline'>
                  {t('user.updateProfile.field.address.label')}
                  <span className='text-muted-foreground text-xs'>({t('common.ui.optional')})</span>
                </FieldLabel>
                <Input
                  {...field}
                  type='tel'
                  value={field.value ?? ''}
                  id={field.name}
                  aria-invalid={fieldState.invalid}
                  autoComplete='off'
                  spellCheck={false}
                />
                <div className='min-h-4'>
                  {fieldState.invalid && <FieldError className='text-xs' errors={[fieldState.error]} />}
                </div>
              </Field>
            )}
          />
        </div>
      </div>
    </div>
  )
}
