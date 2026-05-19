import { queryKeys } from '@/lib/query-keys'
import { useQuery } from '@tanstack/react-query'
import projectRevenueService from '../services'

export interface GetProjectRevenueParams {
  projectIdentifier: string
  pageIndex?: number
  pageSize?: number
  labelIds?: string[]
  searchTerm?: string
  type?: string
  sortBy?: string
  startDate?: string
  endDate?: string
}

export const useGetProjectRevenue = ({
  projectIdentifier,
  pageIndex,
  pageSize,
  labelIds,
  searchTerm,
  type,
  sortBy,
  startDate,
  endDate
}: GetProjectRevenueParams) => {
  const { data: projectRevenues, isLoading: isLoadingProjectRevenues } = useQuery({
    queryKey: queryKeys.projects.revenues.list({
      projectIdentifier,
      pageIndex,
      pageSize,
      labelIds,
      searchTerm,
      type,
      sortBy,
      startDate,
      endDate
    }),
    queryFn: () =>
      projectRevenueService.getProjectRevenue({
        projectIdentifier,
        pageIndex,
        pageSize,
        labelIds,
        searchTerm,
        type,
        sortBy,
        startDate,
        endDate
      }),
    enabled: !!projectIdentifier
  })

  return { projectRevenues, isLoadingProjectRevenues }
}
