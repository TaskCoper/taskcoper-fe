import { queryKeys } from '@/lib/query-keys'
import voucherService from '@/services/voucher.service'
import { getDefaultPaginationResponse } from '@/shared/utils'
import type { VoucherRedemptionRow } from '@/types/voucher.type'
import { useQuery } from '@tanstack/react-query'

export interface GetVoucherRedemptionsParams {
  voucherId?: string
  pageIndex?: number
  pageSize?: number
  sortBy?: string
  searchTerm?: string
}

export const useGetVoucherRedemptions = ({
  voucherId,
  pageIndex,
  pageSize,
  sortBy,
  searchTerm
}: GetVoucherRedemptionsParams) => {
  const { data: redemptions = getDefaultPaginationResponse<VoucherRedemptionRow>(), isLoading: isLoadingRedemptions } =
    useQuery({
      queryKey: queryKeys.vouchers.redemptions({ voucherId, pageIndex, pageSize, sortBy, searchTerm }),
      queryFn: () => voucherService.getVoucherRedemptions({ voucherId, pageIndex, pageSize, sortBy, searchTerm }),
      enabled: !!voucherId
    })

  return { redemptions, isLoadingRedemptions }
}
