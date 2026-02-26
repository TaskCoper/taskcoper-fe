import { queryKeys } from '@/lib/query-keys'
import efficiencyService from '@/services/efficiency.service'
import { useQuery } from '@tanstack/react-query'

export interface GetProjectTaskStatsParams {
  projectId?: string
  from: string
  to: string
  parentMilestoneId?: string
  isViewInMonth?: boolean
  // true -> data is divided by weeks
  // false -> data is divided by months
  // both controlled by from and to
}

export const useGetProjectTaskStats = ({
  projectId,
  from,
  to,
  parentMilestoneId,
  isViewInMonth = false
}: GetProjectTaskStatsParams) => {
  const { data: projectTaskStats, isLoading: isLoadingProjectTaskStats } = useQuery({
    queryKey: queryKeys.efficiency.taskStats({ projectId, from, to, parentMilestoneId, isViewInMonth }),
    queryFn: () => efficiencyService.getProjectTaskStats({ projectId, from, to, parentMilestoneId, isViewInMonth }),
    enabled: !!projectId && !!from && !!to
  })

  return { projectTaskStats, isLoadingProjectTaskStats }
}
