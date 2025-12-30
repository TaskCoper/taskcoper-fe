import projectService from '@/services/project.service'
import { useQuery } from '@tanstack/react-query'

export const useGetProject = ({ projectId }: { projectId?: string }) => {
  const {
    data: project,
    isLoading: isLoadingProject,
    isError: isErrorProject
  } = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => projectService.getProject({ projectId }),
    enabled: !!projectId
  })

  return { project, isLoadingProject, isErrorProject }
}
