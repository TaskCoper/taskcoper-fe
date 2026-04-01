import { queryKeys } from '@/lib/query-keys'
import voucherService from '@/services/voucher.service'
import { useQuery } from '@tanstack/react-query'

export const useGetVoucherTargetStats = () => {
  const { data: voucherTargetStats = [], isLoading: isLoadingVoucherTargetStats } = useQuery({
    queryKey: queryKeys.vouchers.targetStats(),
    queryFn: () => voucherService.getVoucherTargetStats()
  })

  return { voucherTargetStats, isLoadingVoucherTargetStats }
}
