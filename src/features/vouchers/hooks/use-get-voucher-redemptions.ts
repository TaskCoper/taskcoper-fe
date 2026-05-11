import type { VoucherRedemptionRow } from '@/features/vouchers/types'
import { queryKeys } from '@/lib/query-keys'
import { getDefaultPaginationResponse } from '@/shared/utils'
import { useQuery } from '@tanstack/react-query'
import voucherService from '../services'

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
