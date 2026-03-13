import { queryKeys } from '@/lib/query-keys'
import projectService from '@/services/project.service'
import { useQuery } from '@tanstack/react-query'

export interface GetProjectRevenuesParams {
  projectId: string
  pageIndex?: number
  pageSize?: number
  labelIds?: string[]
  searchTerm?: string
  type?: string
  sortBy?: string
  startDate?: string
  endDate?: string
}

export const useGetProjectRevenues = ({
  projectId,
  pageIndex,
  pageSize,
  labelIds,
  searchTerm,
  type,
  sortBy,
  startDate,
  endDate
}: GetProjectRevenuesParams) => {
  const { data: projectRevenues, isLoading: isLoadingProjectRevenues } = useQuery({
    queryKey: queryKeys.projectRevenues.list({
      projectId,
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
      projectService.getProjectRevenues({
        projectId,
        pageIndex,
        pageSize,
        labelIds,
        searchTerm,
        type,
        sortBy,
        startDate,
        endDate
      }),
    enabled: !!projectId
  })

  return { projectRevenues, isLoadingProjectRevenues }
}
