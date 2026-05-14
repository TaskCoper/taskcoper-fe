import { queryKeys } from '@/lib/query-keys'
import { useQuery } from '@tanstack/react-query'
import voucherService from '../services'

export const useGetVoucher = ({ voucherId }: { voucherId?: string }) => {
  const { data: voucher, isLoading: isLoadingVoucher } = useQuery({
    queryKey: queryKeys.vouchers.detail(voucherId),
    queryFn: () => voucherService.getVoucher({ voucherId }),
    enabled: !!voucherId
  })

  return { voucher, isLoadingVoucher }
}
