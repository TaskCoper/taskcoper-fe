import { queryKeys } from '@/lib/query-keys'
import projectService from '@/services/project.service'
import { getDefaultPaginationResponse } from '@/shared/utils'
import type { Project } from '@/types/project.type'
import { useQuery } from '@tanstack/react-query'

export const useGetProjectsForPackage = (enabled: boolean = true) => {
  const {
    data: projects = getDefaultPaginationResponse<Pick<Project, 'id' | 'slug' | 'name' | 'logoImage' | 'coverImage'>>(),
    isLoading: isLoadingProjects
  } = useQuery({
    queryKey: queryKeys.projects.forPackage(),
    queryFn: projectService.getProjectsForPackage,
    enabled
  })

  return { projects, isLoadingProjects }
}
