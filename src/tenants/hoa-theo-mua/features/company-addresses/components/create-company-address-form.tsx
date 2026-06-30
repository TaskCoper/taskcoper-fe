import { ComboboxField } from '@/components/combobox-field'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { InputGroup, InputGroupAddon, InputGroupText, InputGroupTextarea } from '@/components/ui/input-group'
import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { useEffect } from 'react'
import { Controller, useFormContext } from 'react-hook-form'
import { useDebounce } from 'use-debounce'
import { useGetLatLng } from '../../../hooks/use-get-lat-lng'
import { pickBestGeocodeResult } from '../../../services/goong.service'
import { useGetShippingLocations } from '../../orders/hooks/use-get-shipping-locations'
import type { CreateCompanyAddressFormValues } from '../validations'

export default function CreateCompanyAddressForm() {
  const { t } = useTenantTranslation()
  const { control, setValue, watch } = useFormContext<CreateCompanyAddressFormValues>()

  const cityCodeForm = watch('cityCode')
  const addressLineForm = watch('addressLine')
  const wardForm = watch('ward')
  const cityForm = watch('city')

  const { shippingLocations: cities, isLoadingShippingLocations: isLoadingCities } = useGetShippingLocations({
    type: 'CITY'
  })
  const { shippingLocations: wards, isLoadingShippingLocations: isLoadingWards } = useGetShippingLocations({
    type: 'WARD',
    parentId: cityCodeForm,
    enabled: cityCodeForm !== -1
  })

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
      <div className='flex items-start gap-4'>
        <Controller
          name='fullName'
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid} className='gap-1 flex-1'>
              <FieldLabel htmlFor={field.name}>{t('companyAddress.field.fullName.label')}</FieldLabel>
              <Input
                {...field}
                value={field.value ?? ''}
                id={field.name}
                aria-invalid={fieldState.invalid}
                placeholder={t('companyAddress.field.fullName.placeholder')}
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
          name='phone'
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid} className='gap-1 flex-1'>
              <FieldLabel htmlFor={field.name}>{t('companyAddress.field.phoneNumber.label')}</FieldLabel>
              <Input
                {...field}
                type='tel'
                value={field.value ?? ''}
                id={field.name}
                aria-invalid={fieldState.invalid}
                placeholder={t('companyAddress.field.phoneNumber.placeholder')}
                autoComplete='off'
                spellCheck={false}
                inputMode='numeric'
              />
              <div className='min-h-4'>
                {fieldState.invalid && <FieldError className='text-xs' errors={[fieldState.error]} />}
              </div>
            </Field>
          )}
        />
      </div>

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
          options={cities.map((city) => ({
            label: city.name,
            value: String(city.id)
          }))}
          onChange={(value) => {
            if (value === '') {
              setValue('cityCode', -1, { shouldDirty: true })
              setValue('wardCode', -1, { shouldDirty: true })
              setValue('ward', '', { shouldDirty: true })
              setValue('city', '', { shouldDirty: true })
            } else {
              const newCityId = Number(value)
              setValue('cityCode', newCityId, { shouldDirty: true })

              const cityName = cities.find((city) => city.id === newCityId)?.name
              if (cityName) {
                setValue('city', cityName, { shouldDirty: true })
              }

              if (newCityId !== cityCodeForm) {
                setValue('wardCode', -1, { shouldDirty: true })
                setValue('ward', '', { shouldDirty: true })
              }
            }
          }}
          disabled={isLoadingCities || cities.length === 0}
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
            value: String(ward.id)
          }))}
          onChange={(value) => {
            if (value === '') {
              setValue('wardCode', -1, { shouldDirty: true })
              setValue('ward', '', { shouldDirty: true })
            } else {
              const newWardId = Number(value)
              setValue('wardCode', newWardId, { shouldDirty: true })
              const wardName = wards.find((ward) => ward.id === newWardId)?.name
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

      <Controller
        name='remarks'
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid} className='gap-1 w-full'>
            <FieldLabel htmlFor={field.name} className='gap-1 items-baseline'>
              {t('companyAddress.field.remarks.label')}
              <span className='text-muted-foreground text-xs'>({t('common.ui.optional')})</span>
            </FieldLabel>
            <InputGroup>
              <InputGroupTextarea
                {...field}
                id={field.name}
                value={field.value ?? ''}
                placeholder={t('companyAddress.field.remarks.placeholder')}
                rows={4}
                className='min-h-20 resize-none wrap-break-word'
                aria-invalid={fieldState.invalid}
                maxLength={255}
              />
              <InputGroupAddon align='block-end'>
                <InputGroupText className='tabular-nums text-xs'>
                  {(field.value ?? '').length}/255 {t('common.ui.characters')}
                </InputGroupText>
              </InputGroupAddon>
            </InputGroup>
            <div className='min-h-4'>
              {fieldState.invalid && <FieldError className='text-xs' errors={[fieldState.error]} />}
            </div>
          </Field>
        )}
      />
    </div>
  )
}
