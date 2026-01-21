import type { BasePaginationResponse } from '@/lib/axios'
import { queryKeys } from '@/lib/query-keys'
import { useAuthStore } from '@/lib/zustand/auth.store'
import taskService from '@/services/task.service'
import type { Attachment } from '@/types/attachment.type'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

interface UseDeleteAttachmentParams {
  parentMilestoneId: string
  projectId: string
}

export const useDeleteAttachment = ({ parentMilestoneId, projectId }: UseDeleteAttachmentParams) => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()
  const { user } = useAuthStore()

  const { mutate: deleteAttachment, isPending: isDeletingAttachment } = useMutation({
    mutationFn: taskService.deleteAttachment,
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
      queryClient.invalidateQueries({ queryKey: queryKeys.attachments.byTask(variables.taskId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.milestones.byParent(projectId, parentMilestoneId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.myAssigned(projectId, user?.UserId) })
    }
  })

  return { deleteAttachment, isDeletingAttachment }
}
