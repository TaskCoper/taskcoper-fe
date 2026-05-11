import { queryKeys } from '@/lib/query-keys'
import { useQuery } from '@tanstack/react-query'
import projectLabelService from '../services'

interface GetProjectLabelsParams {
  projectIdentifier?: string
  enabled?: boolean
}

export const useGetProjectLabels = ({ projectIdentifier, enabled = true }: GetProjectLabelsParams) => {
  const { data: labels, isLoading: isLoadingLabels } = useQuery({
    queryKey: queryKeys.projects.labels(projectIdentifier),
    queryFn: () => projectLabelService.getProjectLabels({ projectIdentifier }),
    enabled: !!projectIdentifier && enabled
  })

  return { labels, isLoadingLabels }
}
