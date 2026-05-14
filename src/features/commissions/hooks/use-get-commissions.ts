import { queryKeys } from '@/lib/query-keys'
import { DEFAULT_PAGE_INDEX, DEFAULT_PAGE_SIZE } from '@/shared/constants'
import { getDefaultPaginationResponse } from '@/shared/utils'
import { useQuery } from '@tanstack/react-query'
import commissionService from '../services'
import { type CommissionRow } from '../types'

export interface GetCommissionsParams {
  page?: number
  limit?: number
  targetModel?: string[]
  titleLevel?: string[]
  minAmount?: number
  maxAmount?: number
  sortBy?: string
}

export const useGetCommissions = ({
  page = DEFAULT_PAGE_INDEX,
  limit = DEFAULT_PAGE_SIZE,
  targetModel,
  titleLevel,
  minAmount,
  maxAmount,
  sortBy
}: GetCommissionsParams = {}) => {
  const { data: commissions = getDefaultPaginationResponse<CommissionRow>(), isLoading: isLoadingCommissions } =
    useQuery({
      queryKey: queryKeys.commissions.list({ page, limit, targetModel, titleLevel, minAmount, maxAmount, sortBy }),
      queryFn: () =>
        commissionService.getCommissions({ page, limit, targetModel, titleLevel, minAmount, maxAmount, sortBy })
    })

  return { commissions, isLoadingCommissions }
}
