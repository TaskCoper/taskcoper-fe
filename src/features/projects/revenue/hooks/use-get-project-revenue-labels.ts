import { queryKeys } from '@/lib/query-keys'
import { getDefaultPaginationResponse } from '@/shared/utils'
import { useQuery } from '@tanstack/react-query'
import projectRevenueService from '../services'
import type { RevenueLabel } from '../types'

export const useGetProjectRevenueLabels = ({ projectIdentifier }: { projectIdentifier?: string }) => {
  const { data: revenueLabels = getDefaultPaginationResponse<RevenueLabel>(), isLoading: isLoadingRevenueLabels } =
    useQuery({
      queryKey: queryKeys.projects.revenueLabels.list(projectIdentifier),
      queryFn: () => projectRevenueService.getProjectRevenueLabels({ projectIdentifier }),
      enabled: !!projectIdentifier
    })

  return { revenueLabels, isLoadingRevenueLabels }
}
