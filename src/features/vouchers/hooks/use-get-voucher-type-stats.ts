import { queryKeys } from '@/lib/query-keys'
import { useQuery } from '@tanstack/react-query'
import voucherService from '../services'

export const useGetVoucherTypeStats = () => {
  const { data: voucherTypeStats = [], isLoading: isLoadingVoucherTypeStats } = useQuery({
    queryKey: queryKeys.vouchers.typeStats(),
    queryFn: () => voucherService.getVoucherTypeStats()
  })

  return { voucherTypeStats, isLoadingVoucherTypeStats }
}
