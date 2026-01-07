import taskService from '@/services/task.service'
import { useQuery } from '@tanstack/react-query'

export const useGetSubtasks = ({ taskId }: { taskId?: string }) => {
  const {
    data: subtasks,
    isLoading: isLoadingSubtasks,
    error
  } = useQuery({
    queryKey: ['subtasks', taskId],
    queryFn: () => taskService.getSubtasks({ taskId }),
    enabled: !!taskId
  })

  return { subtasks, isLoadingSubtasks, error }
}
