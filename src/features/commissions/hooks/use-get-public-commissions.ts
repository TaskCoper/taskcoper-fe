import { queryKeys } from '@/lib/query-keys'
import commissionService from '@/services/commission.service'
import { getDefaultPaginationResponse } from '@/shared/utils'
import { type CommissionRow } from '@/types/commission.type'
import { useQuery } from '@tanstack/react-query'

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
