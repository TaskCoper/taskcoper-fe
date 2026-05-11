import { queryKeys } from '@/lib/query-keys'
import { getDefaultPaginationResponse } from '@/shared/utils'
import { useQuery } from '@tanstack/react-query'
import type { MilestoneTask } from '../../tasks/core/types'
import milestoneService from '../services'

interface GetMilestoneTasksParams {
  milestoneId?: string
  enabled?: boolean
}

export const useGetMilestoneTasks = ({ milestoneId, enabled = true }: GetMilestoneTasksParams) => {
  const { data: tasks = getDefaultPaginationResponse<MilestoneTask>(), isLoading: isLoadingTasks } = useQuery({
    queryKey: queryKeys.milestones.tasks(milestoneId),
    queryFn: () => milestoneService.getMilestoneTasks({ milestoneId }),
    enabled: !!milestoneId && enabled
  })

  return { tasks, isLoadingTasks }
}
