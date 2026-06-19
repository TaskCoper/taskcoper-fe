import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { PlusCircle } from 'lucide-react'
import CreateCompanyAddressDialog from '../features/company-addresses/components/create-company-address-dialog'
import UpdateCompanyAddressForm from '../features/company-addresses/components/update-company-address-form'
import { useGetCompanyAddress } from '../features/company-addresses/hooks/use-get-company-address'

function AddressFormSkeleton() {
  return (
    <div className='flex flex-col space-y-2'>
      <div className='space-y-1'>
        <Skeleton className='h-5 w-28' />
        <Skeleton className='h-9 w-full' />
        <Skeleton className='h-4 w-24' />
      </div>

      <div className='flex items-center gap-4'>
        <div className='flex-1 space-y-1'>
          <Skeleton className='h-5 w-24' />
          <Skeleton className='h-9 w-full' />
        </div>
        <div className='flex-1 space-y-1'>
          <Skeleton className='h-5 w-20' />
          <Skeleton className='h-9 w-full' />
        </div>
      </div>

      <Skeleton className='h-80 w-full rounded-xl' />

      <div className='flex items-center justify-end gap-2 pt-2'>
        <Skeleton className='h-9 w-20 rounded-md' />
        <Skeleton className='h-9 w-24 rounded-md' />
      </div>
    </div>
  )
}

export default function AddressesListPage() {
  const { t } = useTenantTranslation()
  const { companyAddress, isLoadingCompanyAddress } = useGetCompanyAddress()

  return (
    <div className='p-6 w-2xl mx-auto space-y-6'>
      <div>
        <p className='text-2xl font-bold'>{t('companyAddress.title')}</p>
        <p className='text-sm text-muted-foreground'>{t('companyAddress.description')}</p>
      </div>

      {isLoadingCompanyAddress ? (
        <AddressFormSkeleton />
      ) : companyAddress ? (
        <UpdateCompanyAddressForm companyAddress={companyAddress} />
      ) : (
        <CreateCompanyAddressDialog>
          <Button size='sm'>
            <PlusCircle />
            {t('companyAddress.createButton')}
          </Button>
        </CreateCompanyAddressDialog>
      )}
    </div>
  )
}
