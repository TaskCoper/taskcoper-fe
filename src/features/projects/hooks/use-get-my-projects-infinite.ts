import { queryKeys } from '@/lib/query-keys'
import { useAuthStore } from '@/lib/zustand/auth.store'
import projectService from '@/services/project.service'
import { DEFAULT_PAGE_INDEX, DEFAULT_PAGE_SIZE } from '@/shared/constants'
import type { ProjectPreview } from '@/types/project.type'
import { useInfiniteQuery } from '@tanstack/react-query'
import type { GetMyProjectsParams } from './use-get-my-projects'

type GetMyProjectsInfiniteParams = Omit<GetMyProjectsParams, 'pageIndex'>

export const useGetMyProjectsInfinite = ({
  status,
  searchTerm,
  pageSize = DEFAULT_PAGE_SIZE,
  enabled = true
}: GetMyProjectsInfiniteParams = {}) => {
  const { user } = useAuthStore()

  const query = useInfiniteQuery({
    queryKey: queryKeys.projects.listMyInfinite(user?.UserId, status, searchTerm, pageSize),
    queryFn: ({ pageParam = DEFAULT_PAGE_INDEX }) =>
      projectService.getMyProjects({
        userId: user?.UserId,
        status,
        searchTerm,
        pageIndex: pageParam as number,
        pageSize
      }),
    initialPageParam: DEFAULT_PAGE_INDEX,
    getNextPageParam: (lastPage) => {
      const { pageIndex, totalCount } = lastPage.value
      const totalPages = Math.ceil(totalCount / pageSize)
      return pageIndex < totalPages ? pageIndex + 1 : undefined
    },
    enabled: !!user?.UserId && enabled
  })

  const projects: ProjectPreview[] = query.data?.pages.flatMap((p) => p.value.items) ?? []

  return {
    projects,
    isLoading: query.isLoading,
    isFetchingNextPage: query.isFetchingNextPage,
    hasNextPage: query.hasNextPage ?? false,
    fetchNextPage: query.fetchNextPage
  }
}
