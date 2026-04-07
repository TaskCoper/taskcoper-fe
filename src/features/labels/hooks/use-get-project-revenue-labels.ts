import { queryKeys } from '@/lib/query-keys'
import projectService from '@/services/project.service'
import { useQuery } from '@tanstack/react-query'

export const useGetProjectRevenueLabels = ({ projectIdentifier }: { projectIdentifier?: string }) => {
  const { data: revenueLabels, isLoading: isLoadingRevenueLabels } = useQuery({
    queryKey: queryKeys.projectRevenueLabels.list(projectIdentifier),
    queryFn: () => projectService.getProjectRevenueLabels({ projectIdentifier }),
    enabled: !!projectIdentifier
  })

  return { revenueLabels, isLoadingRevenueLabels }
}
