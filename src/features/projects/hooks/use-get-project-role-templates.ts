import { queryKeys } from '@/lib/query-keys'
import projectService from '@/services/project.service'
import { useQuery } from '@tanstack/react-query'

export const useGetProjectRoleTemplates = ({ projectIdentifier }: { projectIdentifier?: string }) => {
  const { data: projectRoleTemplates, isLoading: isLoadingProjectRoleTemplates } = useQuery({
    queryKey: queryKeys.projects.roles.templates(projectIdentifier),
    queryFn: () => projectService.getProjectRoleTemplates({ projectIdentifier }),
    enabled: !!projectIdentifier
  })

  return { projectRoleTemplates, isLoadingProjectRoleTemplates }
}
