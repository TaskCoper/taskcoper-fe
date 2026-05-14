import { queryKeys } from '@/lib/query-keys'
import { useQuery } from '@tanstack/react-query'
import projectRoleService from '../services'

export const useGetProjectRoleTemplates = ({ projectIdentifier }: { projectIdentifier?: string }) => {
  const { data: projectRoleTemplates, isLoading: isLoadingProjectRoleTemplates } = useQuery({
    queryKey: queryKeys.projects.roles.templates(projectIdentifier),
    queryFn: () => projectRoleService.getProjectRoleTemplates({ projectIdentifier }),
    enabled: !!projectIdentifier
  })

  return { projectRoleTemplates, isLoadingProjectRoleTemplates }
}
