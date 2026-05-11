import { queryKeys } from '@/lib/query-keys'
import { useQuery } from '@tanstack/react-query'
import projectRoleService from '../services'

export interface GetProjectRoleParams {
  projectIdentifier?: string
  roleId?: string
}

export const useGetProjectRole = ({ projectIdentifier, roleId }: GetProjectRoleParams) => {
  const { data: role, isLoading: isLoadingProjectRole } = useQuery({
    queryKey: queryKeys.projects.roles.detail({ projectIdentifier, roleId }),
    queryFn: () => projectRoleService.getProjectRole({ projectIdentifier, roleId }),
    enabled: !!projectIdentifier && !!roleId
  })

  return { role, isLoadingProjectRole }
}
