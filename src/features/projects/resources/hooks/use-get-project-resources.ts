import { queryKeys } from '@/lib/query-keys'
import { DEFAULT_PAGE_INDEX, DEFAULT_PAGE_SIZE } from '@/shared/constants'
import { getDefaultPaginationResponse } from '@/shared/utils'
import { useQuery } from '@tanstack/react-query'
import projectResourceService from '../services'
import type { ProjectResource } from '../types'

export interface GetProjectResourcesParams {
  projectIdentifier?: string
  pageIndex?: number
  pageSize?: number
  sortBy?: string
  name?: string
  from?: string
  to?: string
  mimeTypes?: string[]
  memberIds?: string[]
}

export const useGetProjectResources = ({
  projectIdentifier,
  pageIndex = DEFAULT_PAGE_INDEX,
  pageSize = DEFAULT_PAGE_SIZE,
  sortBy,
  name,
  from,
  to,
  mimeTypes,
  memberIds
}: GetProjectResourcesParams) => {
  const {
    data: projectResources = getDefaultPaginationResponse<ProjectResource>(),
    isLoading: isLoadingProjectResources
  } = useQuery({
    queryKey: queryKeys.projectResources.list({
      projectIdentifier,
      pageIndex,
      pageSize,
      sortBy,
      name,
      from,
      to,
      mimeTypes,
      memberIds
    }),
    queryFn: () =>
      projectResourceService.getProjectResources({
        projectIdentifier,
        pageIndex,
        pageSize,
        sortBy,
        name,
        from,
        to,
        mimeTypes,
        memberIds
      }),
    enabled: !!projectIdentifier
  })

  return { projectResources, isLoadingProjectResources }
}
