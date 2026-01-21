import type { BasePaginationResponse } from '@/lib/axios'
import { queryKeys } from '@/lib/query-keys'
import taskService from '@/services/task.service'
import type { Attachment } from '@/types/attachment.type'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { updateAttachmentSchema, type UpdateAttachmentFormValues } from '../validations'

export const useUpdateAttachment = () => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  const methods = useForm<UpdateAttachmentFormValues>({
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
    resolver: zodResolver(updateAttachmentSchema(t))
  })

  const { mutate: updateAttachment, isPending: isUpdatingAttachment } = useMutation({
    mutationFn: taskService.updateAttachment,
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
    }
  })

  return { methods, updateAttachment, isUpdatingAttachment }
}
