import taskService from '@/services/task.service'
import { getDefaultPaginationResponse } from '@/shared/utils'
import type { TaskMember } from '@/types/task.type'
import { useQuery } from '@tanstack/react-query'

export const useGetTaskMembers = ({ taskId }: { taskId?: string }) => {
  const {
    data: taskMembers = {
      ...getDefaultPaginationResponse<TaskMember>()
    },
    isLoading: isLoadingTaskMembers,
    error
  } = useQuery({
    queryKey: ['taskMembers', taskId],
    queryFn: () => taskService.getTaskMembers({ taskId }),
    enabled: !!taskId
  })

  return { taskMembers, isLoadingTaskMembers, error }
}
