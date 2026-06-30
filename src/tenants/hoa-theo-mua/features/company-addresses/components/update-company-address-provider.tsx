import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { useEffect } from 'react'
import { FormProvider, type SubmitHandler } from 'react-hook-form'
import { useUpdateCompanyAddress } from '../hooks/use-update-company-address'
import type { CompanyAddress } from '../types'
import type { UpdateCompanyAddressFormValues } from '../validations'
import UpdateCompanyAddressForm from './update-company-address-form'

const toFormValues = (companyAddress: CompanyAddress): UpdateCompanyAddressFormValues => ({
  fullName: companyAddress.fullName,
  phone: companyAddress.phone,
  remarks: companyAddress.remarks,
  addressLine: companyAddress.addressLine,
  city: companyAddress.city,
  ward: companyAddress.ward,
  cityCode: -1,
  wardCode: -1,
  country: companyAddress.country,
  latitude: companyAddress.latitude,
  longitude: companyAddress.longitude,
  mapId: companyAddress.mapId
})

export default function UpdateCompanyAddressProvider({ companyAddress }: { companyAddress: CompanyAddress }) {
  const { t } = useTenantTranslation()
  const { methods, updateCompanyAddress, isUpdatingCompanyAddress } = useUpdateCompanyAddress()
  const {
    formState: { isDirty }
  } = methods

  useEffect(() => {
    methods.reset(toFormValues(companyAddress))
  }, [companyAddress, methods])

  const onSubmit: SubmitHandler<UpdateCompanyAddressFormValues> = (body) => {
    updateCompanyAddress({ body, id: companyAddress.id })
  }

  const onReset = () => {
    methods.reset(toFormValues(companyAddress))
  }

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)} className='flex flex-col gap-4'>
        <UpdateCompanyAddressForm companyAddress={companyAddress} />

        <div className='flex items-center gap-2 self-end'>
          <Button type='button' variant='outline' onClick={onReset} disabled={!isDirty || isUpdatingCompanyAddress}>
            {t('companyAddress.update.reset')}
          </Button>
          <Button type='submit' disabled={!isDirty || isUpdatingCompanyAddress}>
            {isUpdatingCompanyAddress ? <Spinner /> : null}
            {t('companyAddress.update.submit')}
          </Button>
        </div>
      </form>
    </FormProvider>
  )
}
