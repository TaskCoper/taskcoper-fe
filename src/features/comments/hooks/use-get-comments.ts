import taskService from '@/services/task.service'
import { getDefaultPaginationResponse } from '@/shared/utils'
import type { Comment } from '@/types/comment.type'
import { useQuery } from '@tanstack/react-query'

export const useGetComments = ({ taskId }: { taskId?: string }) => {
  const {
    data: comments = {
      ...getDefaultPaginationResponse<Comment>()
    },
    isLoading: isLoadingComments,
    error
  } = useQuery({
    queryKey: ['comments', taskId],
    queryFn: () => taskService.getComments({ taskId }),
    enabled: !!taskId
  })

  return { comments, isLoadingComments, error }
}
