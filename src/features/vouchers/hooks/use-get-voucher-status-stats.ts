import { queryKeys } from '@/lib/query-keys'
import voucherService from '@/services/voucher.service'
import { useQuery } from '@tanstack/react-query'

export const useGetVoucherStatusStats = () => {
  const { data: voucherStatusStats = [], isLoading: isLoadingVoucherStatusStats } = useQuery({
    queryKey: queryKeys.vouchers.statusStats(),
    queryFn: () => voucherService.getVoucherStatusStats()
  })

  return { voucherStatusStats, isLoadingVoucherStatusStats }
}
