import { queryKeys } from '@/lib/query-keys'
import { useQuery } from '@tanstack/react-query'
import efficiencyService from '../services'

export interface GetProjectTaskStatsParams {
  projectId?: string
  from: string
  to: string
  parentMilestoneId?: string
  isViewInMonth?: boolean
  userId?: string
  // true -> data is divided by weeks
  // false -> data is divided by months
  // both controlled by from and to
}

export const useGetProjectTaskStats = ({
  projectId,
  from,
  to,
  parentMilestoneId,
  isViewInMonth = false,
  userId
}: GetProjectTaskStatsParams) => {
  const { data: projectTaskStats, isLoading: isLoadingProjectTaskStats } = useQuery({
    queryKey: queryKeys.projects.efficiency.taskStats({
      projectId,
      from,
      to,
      parentMilestoneId,
      isViewInMonth,
      userId
    }),
    queryFn: () =>
      efficiencyService.getProjectTaskStats({ projectId, from, to, parentMilestoneId, isViewInMonth, userId }),
    enabled: !!projectId && !!from && !!to
  })

  return { projectTaskStats, isLoadingProjectTaskStats }
}
