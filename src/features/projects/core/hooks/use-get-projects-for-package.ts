import { queryKeys } from '@/lib/query-keys'
import { getDefaultPaginationResponse } from '@/shared/utils'
import { useQuery } from '@tanstack/react-query'
import projectService from '../services'
import type { Project } from '../types'

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
