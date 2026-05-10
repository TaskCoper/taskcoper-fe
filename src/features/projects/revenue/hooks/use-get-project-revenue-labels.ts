import { queryKeys } from '@/lib/query-keys'
import { getDefaultPaginationResponse } from '@/shared/utils'
import type { RevenueLabel } from '@/types/label.type'
import { useQuery } from '@tanstack/react-query'
import projectRevenueService from '../services'

export const useGetProjectRevenueLabels = ({ projectIdentifier }: { projectIdentifier?: string }) => {
  const { data: revenueLabels = getDefaultPaginationResponse<RevenueLabel>(), isLoading: isLoadingRevenueLabels } =
    useQuery({
      queryKey: queryKeys.projectRevenueLabels.list(projectIdentifier),
      queryFn: () => projectRevenueService.getProjectRevenueLabels({ projectIdentifier }),
      enabled: !!projectIdentifier
    })

  return { revenueLabels, isLoadingRevenueLabels }
}
