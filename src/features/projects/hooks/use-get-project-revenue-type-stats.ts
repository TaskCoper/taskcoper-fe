import { queryKeys } from '@/lib/query-keys'
import projectService from '@/services/project.service'
import { useQuery } from '@tanstack/react-query'

export const useGetProjectRevenueTypeStats = ({ projectIdentifier }: { projectIdentifier?: string }) => {
  const { data: revenueTypeStats = [], isLoading: isLoadingRevenueTypeStats } = useQuery({
    queryKey: queryKeys.projectRevenues.typeStats(projectIdentifier),
    queryFn: () => projectService.getProjectRevenueTypeStats({ projectIdentifier }),
    enabled: !!projectIdentifier
  })

  return { revenueTypeStats, isLoadingRevenueTypeStats }
}
