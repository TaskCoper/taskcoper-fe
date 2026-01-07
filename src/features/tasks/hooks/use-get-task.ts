import taskService from '@/services/task.service'
import { useQuery } from '@tanstack/react-query'

export const useGetTask = ({ taskId }: { taskId?: string }) => {
  const { data: task, isLoading: isLoadingTask } = useQuery({
    queryKey: ['task', taskId],
    queryFn: () => taskService.getTask({ taskId }),
    enabled: !!taskId
  })

  return { task, isLoadingTask }
}
