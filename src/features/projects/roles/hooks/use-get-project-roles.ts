import { queryKeys } from '@/lib/query-keys'
import { getDefaultPaginationResponse } from '@/shared/utils'
import type { ProjectRoleItem } from '@/types/project.type'
import { useQuery } from '@tanstack/react-query'
import projectRoleService from '../services'

export const useGetProjectRoles = ({ identifier }: { identifier?: string }) => {
  const { data: projectRoles = getDefaultPaginationResponse<ProjectRoleItem>(), isLoading: isLoadingProjectRoles } =
    useQuery({
      queryKey: queryKeys.projects.roles.list(identifier),
      queryFn: () => projectRoleService.getProjectRoles({ projectIdentifier: identifier }),
      enabled: !!identifier
    })

  return { projectRoles, isLoadingProjectRoles }
}
