import type { SystemProject } from '@/features/projects/core/types'
import { queryKeys } from '@/lib/query-keys'
import { DEFAULT_PAGE_INDEX, DEFAULT_PAGE_SIZE } from '@/shared/constants'
import { getDefaultPaginationResponse } from '@/shared/utils'
import { useQuery } from '@tanstack/react-query'
import projectService from '../services'

export interface GetProjectsParams {
  searchTerm?: string
  pageIndex?: number
  pageSize?: number
  startDate?: string
  endDate?: string
  organizationId?: string[]
  domainId?: string[]
  sortBy?: string
}

export const useGetProjects = ({
  searchTerm,
  pageIndex = DEFAULT_PAGE_INDEX,
  pageSize = DEFAULT_PAGE_SIZE,
  startDate,
  endDate,
  organizationId,
  domainId,
  sortBy
}: GetProjectsParams = {}) => {
  const { data: projects = getDefaultPaginationResponse<SystemProject>(), isLoading: isLoadingProjects } = useQuery({
    queryKey: queryKeys.projects.list({
      searchTerm,
      pageIndex,
      pageSize,
      startDate,
      endDate,
      organizationId,
      domainId,
      sortBy
    }),
    queryFn: () =>
      projectService.getProjects({
        searchTerm,
        pageIndex,
        pageSize,
        startDate,
        endDate,
        organizationId,
        domainId,
        sortBy
      })
  })

  return { projects, isLoadingProjects }
}
