import { queryKeys } from '@/lib/query-keys'
import projectService from '@/services/project.service'
import { useQuery } from '@tanstack/react-query'

export const useGetProjectRevenueLabelStats = ({ projectId }: { projectId?: string }) => {
  const { data: revenueLabelStats = [], isLoading: isLoadingRevenueLabelStats } = useQuery({
    queryKey: queryKeys.projectRevenueLabels.stats(projectId),
    queryFn: () => projectService.getProjectRevenueLabelStats({ projectId }),
    enabled: !!projectId
  })

  return { revenueLabelStats, isLoadingRevenueLabelStats }
}
