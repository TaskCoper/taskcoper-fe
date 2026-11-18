import { queryKeys } from '@/lib/query-keys'
import { DEFAULT_PAGE_INDEX, DEFAULT_PAGE_SIZE } from '@/shared/constants'
import { getDefaultPaginationResponse } from '@/shared/utils'
import { useQuery } from '@tanstack/react-query'
import projectActivityService from '../services'
import type { ProjectActivity } from '../types'

export interface GetProjectActivitiesParams {
  projectIdentifier?: string
  pageIndex?: number
  pageSize?: number
  searchTerm?: string
  from?: string
  to?: string
  actorUserId?: string
}

export const useGetProjectActivities = ({
  projectIdentifier,
  pageIndex = DEFAULT_PAGE_INDEX,
  pageSize = DEFAULT_PAGE_SIZE,
  searchTerm,
  from,
  to,
  actorUserId
}: GetProjectActivitiesParams) => {
  const {
    data: projectActivities = getDefaultPaginationResponse<ProjectActivity>(),
    isLoading: isLoadingProjectActivities
  } = useQuery({
    queryKey: queryKeys.projects.activities.list({
      projectIdentifier,
      pageIndex,
      pageSize,
      searchTerm,
      from,
      to,
      actorUserId
    }),
    queryFn: () =>
      projectActivityService.getProjectActivities({
        projectIdentifier,
        pageIndex,
        pageSize,
        searchTerm,
        from,
        to,
        actorUserId
      }),
    enabled: !!projectIdentifier
  })

  return { projectActivities, isLoadingProjectActivities }
}
