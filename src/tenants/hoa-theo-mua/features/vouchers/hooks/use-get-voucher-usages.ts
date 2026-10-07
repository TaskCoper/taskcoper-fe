import { keepPreviousData, useQuery } from '@tanstack/react-query'
import voucherService from '../services'
import { voucherKeys } from './query-keys'
import type { PageParams } from '../types'

export const useGetVoucherUsages = (voucherId: string | null, params: PageParams = {}) => {
  const queryParams = { pageIndex: 1, pageSize: 20, ...params }
  const usages = useQuery({
    queryKey: voucherKeys.usages(voucherId ?? '', queryParams),
    queryFn: () => voucherService.getUsages(voucherId!, queryParams),
    enabled: !!voucherId,
    placeholderData: keepPreviousData
  })

  return { usages, isGettingUsages: usages.isLoading }
}
