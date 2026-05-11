import { queryKeys } from '@/lib/query-keys'
import { getDefaultPaginationResponse } from '@/shared/utils'
import { useQuery } from '@tanstack/react-query'
import taskCommentService from '../services'
import type { Comment } from '../types'

export const useGetTaskComments = ({ taskId }: { taskId?: string }) => {
  const {
    data: comments = getDefaultPaginationResponse<Comment>(),
    isLoading: isLoadingComments,
    error
  } = useQuery({
    queryKey: queryKeys.comments.byTask(taskId),
    queryFn: () => taskCommentService.getTaskComments({ taskId }),
    enabled: !!taskId
  })

  return { comments, isLoadingComments, error }
}
