import { useGetMe } from '@/features/auth/hooks/use-get-me'
import type { BasePaginationResponse } from '@/lib/axios'
import { invalidateTaskTree } from '@/lib/invalidations'
import { queryKeys } from '@/lib/query-keys'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import taskCommentService from '../services'
import type { Comment } from '../types'

interface DeleteTaskCommentParams {
  projectIdentifier: string
  parentMilestoneIdentifier: string
}

export const useDeleteTaskComment = ({ projectIdentifier, parentMilestoneIdentifier }: DeleteTaskCommentParams) => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()
  const { me: user } = useGetMe()

  const { mutate: deleteTaskComment, isPending: isDeletingTaskComment } = useMutation({
    mutationFn: taskCommentService.deleteTaskComment,
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
      invalidateTaskTree(queryClient, {
        taskId: variables.taskId,
        projectIdentifier,
        parentMilestoneIdentifier,
        userId: user?.id
      })
    }
  })

  return { deleteTaskComment, isDeletingTaskComment }
}
