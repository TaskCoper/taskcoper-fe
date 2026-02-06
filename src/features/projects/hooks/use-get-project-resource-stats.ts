import { queryKeys } from '@/lib/query-keys'
import projectService from '@/services/project.service'
import { useQuery } from '@tanstack/react-query'

export const useGetProjectResourceStats = ({ projectId }: { projectId?: string }) => {
  const { data: projectResourceStats, isLoading: isLoadingProjectResourceStats } = useQuery({
    queryKey: queryKeys.projects.resourceStats(projectId),
    queryFn: () => projectService.getProjectResourceStats({ projectId }),
    enabled: !!projectId
  })

  return { projectResourceStats, isLoadingProjectResourceStats }
}
