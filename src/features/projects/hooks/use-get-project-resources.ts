import { queryKeys } from '@/lib/query-keys'
import projectService from '@/services/project.service'
import { DEFAULT_PAGE_INDEX, DEFAULT_PAGE_SIZE } from '@/shared/constants'
import { getDefaultPaginationResponse } from '@/shared/utils'
import type { ProjectResource } from '@/types/project.type'
import { useQuery } from '@tanstack/react-query'

export interface UseGetProjectResourcesParams {
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
}: UseGetProjectResourcesParams) => {
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
      projectService.getProjectResources({
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
