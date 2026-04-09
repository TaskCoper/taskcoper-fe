import { queryKeys } from '@/lib/query-keys'
import projectService from '@/services/project.service'
import { useQuery } from '@tanstack/react-query'

export const useGetProject = ({ identifier }: { identifier?: string }) => {
  const {
    data: project,
    isLoading: isLoadingProject,
    isError: isErrorProject
  } = useQuery({
    queryKey: queryKeys.projects.detail(identifier),
    queryFn: () => projectService.getProject({ identifier }),
    enabled: !!identifier
  })

  return { project, isLoadingProject, isErrorProject }
}
