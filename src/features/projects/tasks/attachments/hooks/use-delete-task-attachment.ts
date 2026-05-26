import { useGetMe } from '@/features/auth/hooks/use-get-me'
import type { BasePaginationResponse } from '@/lib/axios'
import { invalidateProjectResources, invalidateTaskTree } from '@/lib/invalidations'
import { queryKeys } from '@/lib/query-keys'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import taskAttachmentService from '../services'
import type { Attachment } from '../types'

interface DeleteTaskAttachmentParams {
  parentMilestoneIdentifier?: string
  projectIdentifier: string
}

export const useDeleteTaskAttachment = ({
  parentMilestoneIdentifier,
  projectIdentifier
}: DeleteTaskAttachmentParams) => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()
  const { me: user } = useGetMe()

  const { mutate: deleteTaskAttachment, isPending: isDeletingTaskAttachment } = useMutation({
    mutationFn: taskAttachmentService.deleteTaskAttachment,
    onSuccess: (message) => {
      toast.success(message)
    },
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.attachments.byTask(variables.taskId) })
      const previousData = queryClient.getQueryData<BasePaginationResponse<Attachment>>(
        queryKeys.attachments.byTask(variables.taskId)
      )

      if (previousData) {
        queryClient.setQueryData<BasePaginationResponse<Attachment>>(
          queryKeys.attachments.byTask(variables.taskId),
          (old) => {
            if (!old) return old

            return {
              ...old,
              value: {
                ...old.value,
                items: old.value.items.filter((item) => item.projectResourceId !== variables.id)
              }
            }
          }
        )
      }

      return { previousData }
    },
    onError: (error, variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(queryKeys.attachments.byTask(variables.taskId), context.previousData)
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
      invalidateProjectResources(queryClient, projectIdentifier)
    }
  })

  return { deleteTaskAttachment, isDeletingTaskAttachment }
}
