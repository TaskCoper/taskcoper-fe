import { queryKeys } from '@/lib/query-keys'
import { useQuery } from '@tanstack/react-query'
import taskService from '../services'

export const useGetTask = ({ taskIdentifier }: { taskIdentifier?: string }) => {
  const { data: task, isLoading: isLoadingTask } = useQuery({
    queryKey: queryKeys.tasks.detail(taskIdentifier),
    queryFn: () => taskService.getTask({ taskIdentifier }),
    enabled: !!taskIdentifier
  })

  return { task, isLoadingTask }
}
