import { DEFAULT_PAGE_INDEX, DEFAULT_PAGE_SIZE } from '@/shared/constants'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import voucherService from '../services'
import { voucherKeys } from './query-keys'
import type { GetVouchersParams } from '../types'

export const useGetVouchers = (params: GetVouchersParams = {}) => {
  const queryParams = { pageIndex: DEFAULT_PAGE_INDEX, pageSize: DEFAULT_PAGE_SIZE, ...params }
  const vouchers = useQuery({
    queryKey: voucherKeys.voucherList(queryParams),
    queryFn: () => voucherService.getVouchers(queryParams),
    placeholderData: keepPreviousData
  })

  return { vouchers, isGettingVouchers: vouchers.isLoading, isFetchingVouchers: vouchers.isFetching }
}
