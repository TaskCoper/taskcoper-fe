import { queryKeys } from '@/lib/query-keys'
import projectService from '@/services/project.service'
import { useQuery } from '@tanstack/react-query'

export const useGetProjectRevenueLabelStats = ({ projectIdentifier }: { projectIdentifier?: string }) => {
  const { data: revenueLabelStats = [], isLoading: isLoadingRevenueLabelStats } = useQuery({
    queryKey: queryKeys.projectRevenueLabels.stats(projectIdentifier),
    queryFn: () => projectService.getProjectRevenueLabelStats({ projectIdentifier }),
    enabled: !!projectIdentifier
  })

  return { revenueLabelStats, isLoadingRevenueLabelStats }
}
