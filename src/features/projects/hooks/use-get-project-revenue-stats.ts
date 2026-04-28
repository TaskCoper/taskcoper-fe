import { queryKeys } from '@/lib/query-keys'
import projectService from '@/services/project.service'
import { useQuery } from '@tanstack/react-query'

export const useGetProjectRevenueStats = ({ projectIdentifier }: { projectIdentifier?: string }) => {
  const { data: revenueStats, isLoading: isLoadingRevenueStats } = useQuery({
    queryKey: queryKeys.projectRevenues.stats(projectIdentifier),
    queryFn: () => projectService.getProjectRevenueStats({ projectIdentifier }),
    enabled: !!projectIdentifier
  })

  return { revenueStats, isLoadingRevenueStats }
}
