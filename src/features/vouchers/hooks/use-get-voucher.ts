import { queryKeys } from '@/lib/query-keys'
import voucherService from '@/services/voucher.service'
import { useQuery } from '@tanstack/react-query'

export const useGetVoucher = ({ voucherId }: { voucherId?: string }) => {
  const { data: voucher, isLoading: isLoadingVoucher } = useQuery({
    queryKey: queryKeys.vouchers.detail(voucherId),
    queryFn: () => voucherService.getVoucher({ voucherId }),
    enabled: !!voucherId
  })

  return { voucher, isLoadingVoucher }
}
