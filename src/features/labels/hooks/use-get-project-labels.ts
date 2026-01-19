import { queryKeys } from '@/lib/query-keys'
import projectService from '@/services/project.service'
import { useQuery } from '@tanstack/react-query'

interface UseGetProjectLabelsProps {
  projectId?: string
  enabled?: boolean
}

export const useGetProjectLabels = ({ projectId, enabled = true }: UseGetProjectLabelsProps) => {
  const { data: labels, isLoading: isLoadingLabels } = useQuery({
    queryKey: queryKeys.projects.labels(projectId),
    queryFn: () => projectService.getLabels({ projectId }),
    enabled: !!projectId && enabled
  })

  return { labels, isLoadingLabels }
}
