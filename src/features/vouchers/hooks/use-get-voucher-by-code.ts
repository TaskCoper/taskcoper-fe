import { queryKeys } from '@/lib/query-keys'
import { useQuery } from '@tanstack/react-query'
import voucherService from '../services'

export const useGetVoucherByCode = ({ voucherCode }: { voucherCode?: string }) => {
  const { data: voucher, isLoading: isLoadingVoucher } = useQuery({
    queryKey: queryKeys.vouchers.byCode(voucherCode),
    queryFn: () => voucherService.getVoucherByCode({ voucherCode }),
    enabled: !!voucherCode
  })

  return { voucher, isLoadingVoucher }
}
