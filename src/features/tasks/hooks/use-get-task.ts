import { queryKeys } from '@/lib/query-keys'
import taskService from '@/services/task.service'
import { useQuery } from '@tanstack/react-query'

export const useGetTask = ({ taskId }: { taskId?: string }) => {
  const { data: task, isLoading: isLoadingTask } = useQuery({
    queryKey: queryKeys.tasks.detail(taskId),
    queryFn: () => taskService.getTask({ taskId }),
    enabled: !!taskId
  })

  return { task, isLoadingTask }
}
