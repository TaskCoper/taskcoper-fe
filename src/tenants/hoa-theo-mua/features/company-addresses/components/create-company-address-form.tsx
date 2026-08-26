import { ComboboxField } from '@/components/combobox-field'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { InputGroup, InputGroupAddon, InputGroupText, InputGroupTextarea } from '@/components/ui/input-group'
import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Controller, useFormContext } from 'react-hook-form'
import { matchShippingLocation } from '../../../utils/match-shipping-location'
import { useGetShippingLocations } from '../../orders/hooks/use-get-shipping-locations'
import type { CreateCompanyAddressFormValues } from '../validations'
import AddressAutocomplete from './address-autocomplete'
import AddressMapField from './address-map-field'

export default function CreateCompanyAddressForm() {
  const { t } = useTenantTranslation()
  const { control, setValue, watch } = useFormContext<CreateCompanyAddressFormValues>()
  // The coordinate the typed address resolved to - map picks are constrained to
  // a radius around it so the pin can be fine-tuned but not moved to a new area.
  const [mapAnchor, setMapAnchor] = useState<{ latitude: number; longitude: number } | null>(null)

  const cityCodeForm = watch('cityCode')
  const wardForm = watch('ward')
  const cityForm = watch('city')
  const latitudeForm = watch('latitude')
  const longitudeForm = watch('longitude')

  const { shippingLocations: cities, isLoadingShippingLocations: isLoadingCities } = useGetShippingLocations({
    type: 'CITY'
  })
  const { shippingLocations: wards, isLoadingShippingLocations: isLoadingWards } = useGetShippingLocations({
    type: 'WARD',
    parentId: cityCodeForm,
    enabled: cityCodeForm !== -1
  })

  // Ward name lifted from a picked address, resolved to a selector option once
  // the newly-set city's ward list has finished loading.
  const pendingWardRef = useRef<string | null>(null)
  const resolvePendingWard = useCallback(() => {
    if (pendingWardRef.current === null || isLoadingWards || wards.length === 0) return
    const matchedWard = matchShippingLocation(wards, pendingWardRef.current)
    if (matchedWard) {
      setValue('wardCode', matchedWard.id, { shouldDirty: true })
      setValue('ward', matchedWard.name, { shouldDirty: true })
    }
    pendingWardRef.current = null
  }, [wards, isLoadingWards, setValue])
  useEffect(() => {
    resolvePendingWard()
  }, [resolvePendingWard])

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
            <AddressAutocomplete
              id={field.name}
              value={field.value ?? ''}
              onValueChange={field.onChange}
              onResolve={({ latitude, longitude, mapId, ward, city }) => {
                setValue('latitude', latitude, { shouldDirty: true })
                setValue('longitude', longitude, { shouldDirty: true })
                setValue('mapId', mapId, { shouldDirty: true })
                // This resolved point becomes the anchor the map pin is
                // constrained to; subsequent drags are measured from here.
                setMapAnchor({ latitude, longitude })

                // Lift the resolved ward/city into their own selectors.
                const matchedCity = matchShippingLocation(cities, city)
                const cityChanged = Boolean(matchedCity && matchedCity.id !== cityCodeForm)
                if (cityChanged && matchedCity) {
                  setValue('cityCode', matchedCity.id, { shouldDirty: true })
                  setValue('city', matchedCity.name, { shouldDirty: true })
                  setValue('wardCode', -1, { shouldDirty: true })
                  setValue('ward', '', { shouldDirty: true })
                }
                pendingWardRef.current = ward || null
                // Same city → its ward list is already loaded, resolve now;
                // a changed city resolves via the effect once wards reload.
                if (!cityChanged) resolvePendingWard()
              }}
              onClear={() => {
                setValue('latitude', 0, { shouldDirty: true })
                setValue('longitude', 0, { shouldDirty: true })
                setValue('mapId', '', { shouldDirty: true })
                setMapAnchor(null)
              }}
              ward={wardForm ?? ''}
              city={cityForm ?? ''}
              placeholder={t('companyAddress.field.addressLine.placeholder')}
              searchingLabel={t('companyAddress.field.addressLine.searching')}
              emptyLabel={t('companyAddress.field.addressLine.empty')}
              invalid={fieldState.invalid}
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

      {/* Always mounted: the map itself only renders once a point exists, but the
          "use my location" control stays available so a pin can be dropped first. */}
      <AddressMapField
        latitude={latitudeForm}
        longitude={longitudeForm}
        onResolve={({ latitude, longitude, mapId, addressLine, ward, city }) => {
          // Sync every field to whatever the reverse geocode landed on:
          // coordinate, address line, and the ward/city selectors.
          setValue('latitude', latitude, { shouldDirty: true })
          setValue('longitude', longitude, { shouldDirty: true })
          setValue('mapId', mapId, { shouldDirty: true })
          if (addressLine) {
            setValue('addressLine', addressLine, { shouldDirty: true })
          }

          // Lift the resolved ward/city into their own selectors.
          const matchedCity = matchShippingLocation(cities, city)
          const cityChanged = Boolean(matchedCity && matchedCity.id !== cityCodeForm)
          if (cityChanged && matchedCity) {
            setValue('cityCode', matchedCity.id, { shouldDirty: true })
            setValue('city', matchedCity.name, { shouldDirty: true })
            setValue('wardCode', -1, { shouldDirty: true })
            setValue('ward', '', { shouldDirty: true })
          }
          pendingWardRef.current = ward || null
          // Same city → its ward list is already loaded, resolve now;
          // a changed city resolves via the effect once wards reload.
          if (!cityChanged) resolvePendingWard()
        }}
        anchorLatitude={mapAnchor?.latitude}
        anchorLongitude={mapAnchor?.longitude}
        hint={t('companyAddress.field.map.hint')}
        useLocationLabel={t('companyAddress.field.map.useLocation')}
        resolvingLabel={t('companyAddress.field.map.resolving')}
        locationErrorLabel={t('companyAddress.field.map.locationError')}
        tooFarLabel={t('companyAddress.field.map.tooFar')}
      />

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
