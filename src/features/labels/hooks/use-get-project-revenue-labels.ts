import { queryKeys } from '@/lib/query-keys'
import projectService from '@/services/project.service'
import { useQuery } from '@tanstack/react-query'

export const useGetProjectRevenueLabels = ({ projectId }: { projectId?: string }) => {
  const { data: revenueLabels, isLoading: isLoadingRevenueLabels } = useQuery({
    queryKey: queryKeys.projectRevenueLabels.list(projectId),
    queryFn: () => projectService.getProjectRevenueLabels({ projectId }),
    enabled: !!projectId
  })

  return { revenueLabels, isLoadingRevenueLabels }
}
