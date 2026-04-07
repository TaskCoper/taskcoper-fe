import { queryKeys } from '@/lib/query-keys'
import projectService from '@/services/project.service'
import { useQuery } from '@tanstack/react-query'

interface UseGetProjectLabelsProps {
  projectIdentifier?: string
  enabled?: boolean
}

export const useGetProjectLabels = ({ projectIdentifier, enabled = true }: UseGetProjectLabelsProps) => {
  const { data: labels, isLoading: isLoadingLabels } = useQuery({
    queryKey: queryKeys.projects.labels(projectIdentifier),
    queryFn: () => projectService.getLabels({ projectIdentifier }),
    enabled: !!projectIdentifier && enabled
  })

  return { labels, isLoadingLabels }
}
