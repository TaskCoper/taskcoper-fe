import { queryKeys } from '@/lib/query-keys'
import { useQuery } from '@tanstack/react-query'
import voucherService from '../services'

export const useGetVoucherScopeStats = () => {
  const { data: voucherScopeStats = [], isLoading: isLoadingVoucherScopeStats } = useQuery({
    queryKey: queryKeys.vouchers.scopeStats(),
    queryFn: () => voucherService.getVoucherScopeStats()
  })

  return { voucherScopeStats, isLoadingVoucherScopeStats }
}
