import { queryKeys } from '@/lib/query-keys'
import voucherService from '@/services/voucher.service'
import { useQuery } from '@tanstack/react-query'

export const useGetVoucherScopeStats = () => {
  const { data: voucherScopeStats = [], isLoading: isLoadingVoucherScopeStats } = useQuery({
    queryKey: queryKeys.vouchers.scopeStats(),
    queryFn: () => voucherService.getVoucherScopeStats()
  })

  return { voucherScopeStats, isLoadingVoucherScopeStats }
}
