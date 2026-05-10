import { queryKeys } from '@/lib/query-keys'
import milestoneService from '../services'
import { getDefaultPaginationResponse } from '@/shared/utils'
import type { MilestoneTask } from '@/types/task.type'
import { useQuery } from '@tanstack/react-query'

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
