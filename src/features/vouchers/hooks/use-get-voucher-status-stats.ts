import { queryKeys } from '@/lib/query-keys'
import { useQuery } from '@tanstack/react-query'
import voucherService from '../services'

export const useGetVoucherStatusStats = () => {
  const { data: voucherStatusStats = [], isLoading: isLoadingVoucherStatusStats } = useQuery({
    queryKey: queryKeys.vouchers.statusStats(),
    queryFn: () => voucherService.getVoucherStatusStats()
  })

  return { voucherStatusStats, isLoadingVoucherStatusStats }
}
