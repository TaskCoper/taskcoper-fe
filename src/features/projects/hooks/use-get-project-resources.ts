import { queryKeys } from '@/lib/query-keys'
import projectService from '@/services/project.service'
import { getDefaultPaginationResponse } from '@/shared/utils'
import type { ProjectResource } from '@/types/project.type'
import { useQuery } from '@tanstack/react-query'

export const useGetProjectResources = ({ projectId }: { projectId?: string }) => {
  const {
    data: projectResources = getDefaultPaginationResponse<ProjectResource>(),
    isLoading: isLoadingProjectResources
  } = useQuery({
    queryKey: queryKeys.projectResources.all(projectId),
    queryFn: () => projectService.getProjectResources({ projectId }),
    enabled: !!projectId
  })

  return { projectResources, isLoadingProjectResources }
}
