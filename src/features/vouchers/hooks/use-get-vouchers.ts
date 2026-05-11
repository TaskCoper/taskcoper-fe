import type { VoucherRow } from '@/features/vouchers/types'
import { queryKeys } from '@/lib/query-keys'
import { getDefaultPaginationResponse } from '@/shared/utils'
import { useQuery } from '@tanstack/react-query'
import voucherService from '../services'

export interface GetVouchersParams {
  pageIndex?: number
  pageSize?: number
  searchTerm?: string
  isActive?: boolean
  discountType?: string[]
  scope?: string[]
  targetType?: string
  targetId?: string
  sortBy?: string
  startTime?: string
  endTime?: string
}

export const useGetVouchers = ({
  pageIndex,
  pageSize,
  searchTerm,
  isActive,
  discountType,
  scope,
  targetType,
  targetId,
  sortBy,
  startTime,
  endTime
}: GetVouchersParams = {}) => {
  const { data: vouchers = getDefaultPaginationResponse<VoucherRow>(), isLoading: isLoadingVouchers } = useQuery({
    queryKey: queryKeys.vouchers.list({
      pageIndex,
      pageSize,
      searchTerm,
      isActive,
      discountType,
      scope,
      targetType,
      targetId,
      sortBy,
      startTime,
      endTime
    }),
    queryFn: () =>
      voucherService.getVouchers({
        pageIndex,
        pageSize,
        searchTerm,
        isActive,
        discountType,
        scope,
        targetType,
        targetId,
        sortBy,
        startTime,
        endTime
      })
  })

  return { vouchers, isLoadingVouchers }
}
