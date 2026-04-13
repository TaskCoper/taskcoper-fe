import { queryKeys } from '@/lib/query-keys'
import projectService from '@/services/project.service'
import { getDefaultPaginationResponse } from '@/shared/utils'
import type { ProjectRoleItem } from '@/types/project.type'
import { useQuery } from '@tanstack/react-query'

export const useGetProjectRoles = ({ identifier }: { identifier?: string }) => {
  const { data: projectRoles = getDefaultPaginationResponse<ProjectRoleItem>(), isLoading: isLoadingProjectRoles } =
    useQuery({
      queryKey: queryKeys.projects.roles.list(identifier),
      queryFn: () => projectService.getProjectRoles({ projectIdentifier: identifier }),
      enabled: !!identifier
    })

  return { projectRoles, isLoadingProjectRoles }
}
