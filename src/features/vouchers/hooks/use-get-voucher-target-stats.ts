import { queryKeys } from '@/lib/query-keys'
import { useQuery } from '@tanstack/react-query'
import voucherService from '../services'

export const useGetVoucherTargetStats = () => {
  const { data: voucherTargetStats = [], isLoading: isLoadingVoucherTargetStats } = useQuery({
    queryKey: queryKeys.vouchers.targetStats(),
    queryFn: () => voucherService.getVoucherTargetStats()
  })

  return { voucherTargetStats, isLoadingVoucherTargetStats }
}
