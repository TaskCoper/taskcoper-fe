import { queryKeys } from '@/lib/query-keys'
import { getDefaultPaginationResponse } from '@/shared/utils'
import { useQuery } from '@tanstack/react-query'
import commissionService from '../services'
import { type CommissionRow } from '../types'

export const useGetPublicCommissions = () => {
  const {
    data: publicCommissions = getDefaultPaginationResponse<CommissionRow>(),
    isLoading: isLoadingPublicCommissions
  } = useQuery({
    queryKey: queryKeys.commissions.public(),
    queryFn: () => commissionService.getPublicCommissions()
  })

  return { publicCommissions, isLoadingPublicCommissions }
}
