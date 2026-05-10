import type { BasePaginationResponse } from '@/lib/axios'
import { queryKeys } from '@/lib/query-keys'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import taskAttachmentService from '../services'
import type { Attachment } from '../types'
import { updateTaskAttachmentSchema, type UpdateTaskAttachmentFormValues } from '../validations'

export const useUpdateTaskAttachment = ({ projectIdentifier }: { projectIdentifier: string }) => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  const methods = useForm<UpdateTaskAttachmentFormValues>({
    defaultValues: {
      name: '',
      url: '',
      bytes: 0,
      mimeType: '',
      storageKey: '',
      position: 0,
      taskId: '',
      projectResourceId: '',
      isUpload: false
    },
    resolver: zodResolver(updateTaskAttachmentSchema(t))
  })

  const { mutate: updateTaskAttachment, isPending: isUpdatingTaskAttachment } = useMutation({
    mutationFn: taskAttachmentService.updateTaskAttachment,
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.attachments.byTask(variables.body.taskId) })
      const previousData = queryClient.getQueryData<BasePaginationResponse<Attachment>>(
        queryKeys.attachments.byTask(variables.body.taskId)
      )

      if (previousData) {
        queryClient.setQueryData<BasePaginationResponse<Attachment>>(
          queryKeys.attachments.byTask(variables.body.taskId),
          (old) => {
            if (!old) return old

            return {
              ...old,
              value: {
                ...old.value,
                items: old.value.items.map((item) => {
                  if (item.projectResourceId === variables.body.projectResourceId) {
                    return { ...item, name: variables.body.name, url: variables.body.url }
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
    onSuccess: () => {
      methods.reset()
    },
    onError: (error, variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(queryKeys.attachments.byTask(variables.body.taskId), context.previousData)
      }

      toast(t('error.somethingWentWrong'), {
        description: error.response?.data?.detail
      })
    },
    onSettled: (_, _error, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.attachments.byTask(variables.body.taskId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.comments.byTask(variables.body.taskId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.projectResources.all(projectIdentifier) })
    }
  })

  return { methods, updateTaskAttachment, isUpdatingTaskAttachment }
}
