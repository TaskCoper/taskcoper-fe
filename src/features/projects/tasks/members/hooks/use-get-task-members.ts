import { queryKeys } from '@/lib/query-keys'
import { getDefaultPaginationResponse } from '@/shared/utils'
import { useQuery } from '@tanstack/react-query'
import taskMemberService from '../services'
import type { TaskMember } from '../types'

export const useGetTaskMembers = ({ taskId }: { taskId?: string }) => {
  const {
    data: taskMembers = getDefaultPaginationResponse<TaskMember>(),
    isLoading: isLoadingTaskMembers,
    error
  } = useQuery({
    queryKey: queryKeys.tasks.members(taskId),
    queryFn: () => taskMemberService.getTaskMembers({ taskId }),
    enabled: !!taskId
  })

  return { taskMembers, isLoadingTaskMembers, error }
}
