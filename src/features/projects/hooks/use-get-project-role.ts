import { queryKeys } from '@/lib/query-keys'
import projectService from '@/services/project.service'
import { useQuery } from '@tanstack/react-query'

export interface GetProjectRoleParams {
  projectIdentifier?: string
  roleId?: string
}

export const useGetProjectRole = ({ projectIdentifier, roleId }: GetProjectRoleParams) => {
  const { data: role, isLoading: isLoadingProjectRole } = useQuery({
    queryKey: queryKeys.projects.roles.detail({ projectIdentifier, roleId }),
    queryFn: () => projectService.getProjectRole({ projectIdentifier, roleId }),
    enabled: !!projectIdentifier && !!roleId
  })

  return { role, isLoadingProjectRole }
}
