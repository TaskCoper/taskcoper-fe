import { queryKeys } from '@/lib/query-keys'
import { useQuery } from '@tanstack/react-query'
import projectAnalyticService from '../services'

export const useGetProjectRevenueLabelStats = ({ projectIdentifier }: { projectIdentifier?: string }) => {
  const { data: revenueLabelStats = [], isLoading: isLoadingRevenueLabelStats } = useQuery({
    queryKey: queryKeys.projects.revenueLabels.stats(projectIdentifier),
    queryFn: () => projectAnalyticService.getProjectRevenueLabelStats({ projectIdentifier }),
    enabled: !!projectIdentifier
  })

  return { revenueLabelStats, isLoadingRevenueLabelStats }
}
