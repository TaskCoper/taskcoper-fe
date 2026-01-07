import type { BasePaginationResponse } from '@/lib/axios'
import subtaskService from '@/services/subtask.service'
import type { Subtask } from '@/types/subtask.type'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { type UpdateSubtaskFormValues, updateSubtaskSchema } from '../validations'

export const useUpdateSubtask = ({ taskId }: { taskId?: string } = {}) => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  const methods = useForm<UpdateSubtaskFormValues>({
    resolver: zodResolver(updateSubtaskSchema(t))
  })

  const queryKey = ['subtasks', taskId]

  const { mutate: updateSubtask, isPending: isUpdatingSubtask } = useMutation({
    mutationFn: subtaskService.updateSubtask,
    onMutate: async (variables) => {
      if (!taskId) return

      await queryClient.cancelQueries({ queryKey })
      const previousData = queryClient.getQueryData<BasePaginationResponse<Subtask>>(queryKey)

      if (previousData) {
        queryClient.setQueryData<BasePaginationResponse<Subtask>>(queryKey, (old) => {
          if (!old) return old

          const newItems = old.value.items.map((item) =>
            item.id === variables.body.id
              ? { ...item, name: variables.body.name, index: variables.body.index, parentId: variables.body.parentId }
              : item
          )

          return {
            ...old,
            value: {
              ...old.value,
              items: newItems
            }
          }
        })
      }

      return { previousData }
    },
    onError: (error, _variables, context) => {
      if (taskId && context?.previousData) {
        queryClient.setQueryData(queryKey, context.previousData)
      }

      toast(t('error.somethingWentWrong'), {
        description: error.response?.data?.detail
      })
    },
    onSettled: () => {
      if (taskId) {
        queryClient.invalidateQueries({ queryKey })
      }
    }
  })

  return { methods, updateSubtask, isUpdatingSubtask }
}
