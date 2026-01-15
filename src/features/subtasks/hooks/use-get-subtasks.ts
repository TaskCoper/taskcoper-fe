import { queryKeys } from '@/lib/query-keys'
import taskService from '@/services/task.service'
import { useQuery } from '@tanstack/react-query'

export const useGetSubtasks = ({ taskId }: { taskId?: string }) => {
  const {
    data: subtasks,
    isLoading: isLoadingSubtasks,
    error
  } = useQuery({
    queryKey: queryKeys.subtasks.byTask(taskId),
    queryFn: () => taskService.getSubtasks({ taskId }),
    enabled: !!taskId
  })

  return { subtasks, isLoadingSubtasks, error }
}
