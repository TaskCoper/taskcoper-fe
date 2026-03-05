import { queryKeys } from '@/lib/query-keys'
import projectService from '@/services/project.service'
import { getDefaultPaginationResponse } from '@/shared/utils'
import type { RevenueLabel } from '@/types/label.type'
import { useQuery } from '@tanstack/react-query'

export const useGetRevenueLabels = ({ projectId }: { projectId?: string }) => {
  const { data: revenueLabels = getDefaultPaginationResponse<RevenueLabel>(), isLoading: isLoadingRevenueLabels } =
    useQuery({
      queryKey: queryKeys.projectRevenue.labels(projectId),
      queryFn: () => projectService.getRevenueLabels({ projectId: projectId! }),
      enabled: !!projectId
    })

  return { revenueLabels, isLoadingRevenueLabels }
}
