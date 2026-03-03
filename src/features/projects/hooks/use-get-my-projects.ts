import { queryKeys } from '@/lib/query-keys'
import { useAuthStore } from '@/lib/zustand/auth.store'
import projectService from '@/services/project.service'
import { DEFAULT_PAGE_INDEX, DEFAULT_PAGE_SIZE } from '@/shared/constants'
import { getDefaultPaginationResponse } from '@/shared/utils'
import type { ProjectPreview } from '@/types/project.type'
import { useQuery } from '@tanstack/react-query'

export interface GetMyProjectsParams {
  userId?: string
  status?: string[]
  searchTerm?: string
  pageIndex?: number
  pageSize?: number
}

export const useGetMyProjects = ({
  status,
  searchTerm,
  pageIndex = DEFAULT_PAGE_INDEX,
  pageSize = DEFAULT_PAGE_SIZE
}: GetMyProjectsParams) => {
  const { user } = useAuthStore()

  const { data: myProjects = getDefaultPaginationResponse<ProjectPreview>(), isLoading: isLoadingMyProjects } =
    useQuery({
      queryKey: queryKeys.projects.listMy(user?.UserId, status, searchTerm, pageIndex, pageSize),
      queryFn: () => projectService.getMyProjects({ userId: user?.UserId, status, searchTerm, pageIndex, pageSize }),
      enabled: !!user?.UserId
    })

  return { myProjects, isLoadingMyProjects }
}
