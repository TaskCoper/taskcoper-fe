import { queryKeys } from '@/lib/query-keys'
import voucherService from '@/services/voucher.service'
import { useQuery } from '@tanstack/react-query'

export const useGetVoucherTypeStats = () => {
  const { data: voucherTypeStats = [], isLoading: isLoadingVoucherTypeStats } = useQuery({
    queryKey: queryKeys.vouchers.typeStats(),
    queryFn: () => voucherService.getVoucherTypeStats()
  })

  return { voucherTypeStats, isLoadingVoucherTypeStats }
}
