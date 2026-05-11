import type { BasePaginationResponse } from '@/lib/axios'
import { queryKeys } from '@/lib/query-keys'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import taskCommentService from '../services'
import type { Comment } from '../types'
import { updateTaskCommentSchema, type UpdateTaskCommentFormValues } from '../validations'

export const useUpdateTaskComment = () => {
  const { t } = useTranslation()
  const queryClient = useQueryClient()

  const methods = useForm<UpdateTaskCommentFormValues>({
    resolver: zodResolver(updateTaskCommentSchema(t))
  })

  const { mutate: updateTaskComment, isPending: isUpdatingTaskComment } = useMutation({
    mutationFn: taskCommentService.updateTaskComment,
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.comments.byTask(variables.body.taskId) })
      const previousData = queryClient.getQueryData<BasePaginationResponse<Comment>>(
        queryKeys.comments.byTask(variables.body.taskId)
      )

      if (previousData) {
        queryClient.setQueryData<BasePaginationResponse<Comment>>(
          queryKeys.comments.byTask(variables.body.taskId),
          (old) => {
            if (!old) return old

            return {
              ...old,
              value: {
                ...old.value,
                items: old.value.items.map((item) => {
                  if (item.commentId === variables.body.commentId) {
                    return {
                      ...item,
                      content: variables.body.content,
                      mentionedUsers: item.mentionedUsers
                    }
                  }

                  return item
                })
              }
            }
          }
        )
      }

      return { previousData }
    },
    onError: (error, variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(queryKeys.comments.byTask(variables.body.taskId), context.previousData)
      }

      toast(t('error.somethingWentWrong'), {
        description: error.response?.data?.detail
      })
    },
    onSettled: (_, _error, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.comments.byTask(variables.body.taskId) })
    }
  })

  return { methods, updateTaskComment, isUpdatingTaskComment }
}
