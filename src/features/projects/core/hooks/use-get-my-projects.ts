import { useGetMe } from '@/features/auth/hooks/use-get-me'
import { queryKeys } from '@/lib/query-keys'
import { DEFAULT_PAGE_INDEX, DEFAULT_PAGE_SIZE } from '@/shared/constants'
import { getDefaultPaginationResponse } from '@/shared/utils'
import type { ProjectPreview } from '@/types/project.type'
import { useQuery } from '@tanstack/react-query'
import projectService from '../services'

export interface GetMyProjectsParams {
  userId?: string
  status?: string[]
  searchTerm?: string
  pageIndex?: number
  pageSize?: number
  enabled?: boolean
}

export const useGetMyProjects = ({
  status,
  searchTerm,
  enabled = true,
  pageIndex = DEFAULT_PAGE_INDEX,
  pageSize = DEFAULT_PAGE_SIZE
}: GetMyProjectsParams) => {
  const { me: user } = useGetMe()

  const { data: myProjects = getDefaultPaginationResponse<ProjectPreview>(), isLoading: isLoadingMyProjects } =
    useQuery({
      queryKey: queryKeys.projects.listMy(user?.id, status, searchTerm, pageIndex, pageSize),
      queryFn: () => projectService.getMyProjects({ userId: user?.id, status, searchTerm, pageIndex, pageSize }),
      enabled: !!user?.id && enabled
    })

  return { myProjects, isLoadingMyProjects }
}
