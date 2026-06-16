import { ComboboxField } from '@/components/combobox-field'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { useGetProvinces } from '@/hooks/use-get-provinces'
import { useGetWards } from '@/hooks/use-get-wards'
import { useEffect } from 'react'
import { Controller, useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useDebounce } from 'use-debounce'
import { useGetLatLng } from '../../../hooks/use-get-lat-lng'
import { pickBestGeocodeResult } from '../../../services/goong.service'
import type { CreateCompanyAddressFormValues } from '../validations'

export default function CreateCompanyAddressForm() {
  const { t } = useTranslation()
  const { control, setValue, watch } = useFormContext<CreateCompanyAddressFormValues>()

  const cityCodeForm = watch('cityCode')
  const addressLineForm = watch('addressLine')
  const wardForm = watch('ward')
  const cityForm = watch('city')

  const { provinces, isLoadingProvinces } = useGetProvinces()
  const { wards, isLoadingWards } = useGetWards(cityCodeForm ?? -1)

  const fullAddress = addressLineForm && wardForm && cityForm ? `${addressLineForm}, ${wardForm}, ${cityForm}` : ''
  const [debouncedAddress] = useDebounce(fullAddress, 300)

  const { latLng } = useGetLatLng({ address: debouncedAddress, enabled: !!debouncedAddress })

  useEffect(() => {
    if (!debouncedAddress) return
    const best = pickBestGeocodeResult(debouncedAddress, latLng)
    if (!best) return
    setValue('latitude', best.geometry.location.lat, { shouldDirty: true })
    setValue('longitude', best.geometry.location.lng, { shouldDirty: true })
    setValue('mapId', best.place_id, { shouldDirty: true })
  }, [latLng, debouncedAddress, setValue])

  return (
    <div className='space-y-2'>
      <Controller
        name='addressLine'
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
              setValue('ward', '', { shouldDirty: true })
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
                setValue('ward', '', { shouldDirty: true })
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
              setValue('ward', '', { shouldDirty: true })
            } else {
              setValue('wardCode', Number(value), { shouldDirty: true })
              const wardName = wards.find((ward) => ward.code === Number(value))?.name
              if (wardName) {
                setValue('ward', wardName, { shouldDirty: true })
              }
            }
          }}
          disabled={isLoadingWards || wards.length === 0}
          placeholder='user.updateProfile.field.ward.placeholder'
          searchPlaceholder='user.updateProfile.field.ward.searchPlaceholder'
          modal
        />
      </div>
    </div>
  )
}
