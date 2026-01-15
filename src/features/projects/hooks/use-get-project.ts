import { queryKeys } from '@/lib/query-keys'
import projectService from '@/services/project.service'
import { useQuery } from '@tanstack/react-query'

export const useGetProject = ({ projectId }: { projectId?: string }) => {
  const {
    data: project,
    isLoading: isLoadingProject,
    isError: isErrorProject
  } = useQuery({
    queryKey: queryKeys.projects.detail(projectId),
    queryFn: () => projectService.getProject({ projectId }),
    enabled: !!projectId
  })

  return { project, isLoadingProject, isErrorProject }
}
