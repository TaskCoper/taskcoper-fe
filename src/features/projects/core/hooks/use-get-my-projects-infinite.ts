import { useGetMe } from '@/features/auth/hooks/use-get-me'
import { queryKeys } from '@/lib/query-keys'
import { DEFAULT_PAGE_INDEX, DEFAULT_PAGE_SIZE } from '@/shared/constants'
import { useInfiniteQuery } from '@tanstack/react-query'
import projectService from '../services'
import type { ProjectPreview } from '../types'
import type { GetMyProjectsParams } from './use-get-my-projects'

type GetMyProjectsInfiniteParams = Omit<GetMyProjectsParams, 'pageIndex'>

export const useGetMyProjectsInfinite = ({
  status,
  searchTerm,
  pageSize = DEFAULT_PAGE_SIZE,
  enabled = true
}: GetMyProjectsInfiniteParams = {}) => {
  const { me: user } = useGetMe()

  const query = useInfiniteQuery({
    queryKey: queryKeys.projects.listMyInfinite(user?.id, status, searchTerm, pageSize),
    queryFn: ({ pageParam = DEFAULT_PAGE_INDEX }) =>
      projectService.getMyProjects({
        userId: user?.id,
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
    enabled: !!user?.id && enabled
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
