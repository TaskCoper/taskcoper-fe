import { queryKeys } from '@/lib/query-keys'
import voucherService from '@/services/voucher.service'
import { useQuery } from '@tanstack/react-query'

export const useGetVoucherByCode = ({ voucherCode }: { voucherCode?: string }) => {
  const { data: voucher, isLoading: isLoadingVoucher } = useQuery({
    queryKey: queryKeys.vouchers.byCode(voucherCode),
    queryFn: () => voucherService.getVoucherByCode({ voucherCode }),
    enabled: !!voucherCode
  })

  return { voucher, isLoadingVoucher }
}
