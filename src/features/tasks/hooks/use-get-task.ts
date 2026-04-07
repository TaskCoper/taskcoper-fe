import { queryKeys } from '@/lib/query-keys'
import taskService from '@/services/task.service'
import { useQuery } from '@tanstack/react-query'

export const useGetTask = ({ taskIdentifier }: { taskIdentifier?: string }) => {
  const { data: task, isLoading: isLoadingTask } = useQuery({
    queryKey: queryKeys.tasks.detail(taskIdentifier),
    queryFn: () => taskService.getTask({ taskIdentifier }),
    enabled: !!taskIdentifier
  })

  return { task, isLoadingTask }
}
