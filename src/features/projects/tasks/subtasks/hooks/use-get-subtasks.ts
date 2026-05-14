import { queryKeys } from '@/lib/query-keys'
import { useQuery } from '@tanstack/react-query'
import taskSubtaskService from '../services'

export const useGetTaskSubtasks = ({ taskId }: { taskId?: string }) => {
  const {
    data: subtasks,
    isLoading: isLoadingSubtasks,
    error
  } = useQuery({
    queryKey: queryKeys.subtasks.byTask(taskId),
    queryFn: () => taskSubtaskService.getTaskSubtasks({ taskId }),
    enabled: !!taskId
  })

  return { subtasks, isLoadingSubtasks, error }
}
