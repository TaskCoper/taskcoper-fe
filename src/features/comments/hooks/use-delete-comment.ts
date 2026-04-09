import type { BasePaginationResponse } from '@/lib/axios'
import { queryKeys } from '@/lib/query-keys'
import { useAuthStore } from '@/lib/zustand/auth.store'
import taskService from '@/services/task.service'
import type { Comment } from '@/types/comment.type'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

interface UseDeleteCommentProps {
  projectIdentifier: string
  parentMilestoneIdentifier: string
}

export const useDeleteComment = ({ projectIdentifier, parentMilestoneIdentifier }: UseDeleteCommentProps) => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()
  const { user } = useAuthStore()

  const { mutate: deleteComment, isPending: isDeletingComment } = useMutation({
    mutationFn: taskService.deleteComment,
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.comments.byTask(variables.taskId) })
      const previousData = queryClient.getQueryData<BasePaginationResponse<Comment>>(
        queryKeys.comments.byTask(variables.taskId)
      )

      if (previousData) {
        queryClient.setQueryData<BasePaginationResponse<Comment>>(
          queryKeys.comments.byTask(variables.taskId),
          (old) => {
            if (!old) return old

            return {
              ...old,
              value: {
                ...old.value,
                items: old.value.items.filter((item) => item.commentId !== variables.commentId)
              }
            }
          }
        )
      }

      return { previousData }
    },
    onError: (error, variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(queryKeys.comments.byTask(variables.taskId), context.previousData)
      }

      toast(t('error.somethingWentWrong'), {
        description: error.response?.data?.detail
      })
    },
    onSettled: (_, _error, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.comments.byTask(variables.taskId) })
      queryClient.invalidateQueries({
        queryKey: queryKeys.milestones.byParent(projectIdentifier, parentMilestoneIdentifier)
      })
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.listParent(parentMilestoneIdentifier) })
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.myAssigned(projectIdentifier, user?.UserId) })
    }
  })

  return { deleteComment, isDeletingComment }
}
