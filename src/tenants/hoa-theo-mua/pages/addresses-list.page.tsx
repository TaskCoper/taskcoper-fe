import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { PlusCircle } from 'lucide-react'
import CreateCompanyAddressDialog from '../features/company-addresses/components/create-company-address-dialog'
import UpdateCompanyAddressProvider from '../features/company-addresses/components/update-company-address-provider'
import { useGetCompanyAddress } from '../features/company-addresses/hooks/use-get-company-address'

export default function AddressesListPage() {
  const { companyAddress, isLoadingCompanyAddress } = useGetCompanyAddress()

  return (
    <div className='p-4 w-3xl mx-auto space-y-6'>
      <div>
        <p className='text-2xl font-bold'>Địa chỉ công ty</p>
        <p className='text-sm text-muted-foreground'>Đây là địa chỉ dùng để cho các dịch vụ vận chuyển</p>
      </div>

      {isLoadingCompanyAddress ? (
        <Skeleton className='h-32' />
      ) : companyAddress ? (
        <UpdateCompanyAddressProvider companyAddress={companyAddress} />
      ) : (
        <CreateCompanyAddressDialog>
          <Button size='sm'>
            <PlusCircle />
            Thêm địa chỉ công ty
          </Button>
        </CreateCompanyAddressDialog>
      )}
    </div>
  )
}
