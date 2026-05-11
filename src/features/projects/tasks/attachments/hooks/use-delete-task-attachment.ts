import { useGetMe } from '@/features/auth/hooks/use-get-me'
import type { BasePaginationResponse } from '@/lib/axios'
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
      queryClient.invalidateQueries({ queryKey: queryKeys.attachments.byTask(variables.taskId) })
      if (parentMilestoneIdentifier) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.milestones.byParent(projectIdentifier, parentMilestoneIdentifier)
        })
        queryClient.invalidateQueries({ queryKey: queryKeys.tasks.listParent(parentMilestoneIdentifier) })
      }
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.myAssigned(projectIdentifier, user?.id) })
      queryClient.invalidateQueries({ queryKey: queryKeys.comments.byTask(variables.taskId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.projectResources.all(projectIdentifier) })
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.resourceStats(projectIdentifier) })
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.resourceMemberStats(projectIdentifier) })
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.mimeTypeStats(projectIdentifier) })
    }
  })

  return { deleteTaskAttachment, isDeletingTaskAttachment }
}
