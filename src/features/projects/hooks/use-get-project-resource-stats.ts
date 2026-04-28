import { queryKeys } from '@/lib/query-keys'
import projectService from '@/services/project.service'
import { useQuery } from '@tanstack/react-query'

export const useGetProjectResourceStats = ({ projectIdentifier }: { projectIdentifier?: string }) => {
  const { data: projectResourceStats, isLoading: isLoadingProjectResourceStats } = useQuery({
    queryKey: queryKeys.projects.resourceStats(projectIdentifier),
    queryFn: () => projectService.getProjectResourceStats({ projectIdentifier }),
    enabled: !!projectIdentifier
  })

  return { projectResourceStats, isLoadingProjectResourceStats }
}
