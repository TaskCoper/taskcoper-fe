import type { BasePaginationResponse } from '@/lib/axios'
import subtaskService from '@/services/subtask.service'
import type { Subtask } from '@/types/subtask.type'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { updateSubtaskStatusSchema, type UpdateSubtaskStatusFormValues } from '../validations'

export const useUpdateSubtaskStatus = ({ taskId }: { taskId?: string } = {}) => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  const methods = useForm<UpdateSubtaskStatusFormValues>({
    resolver: zodResolver(updateSubtaskStatusSchema(t))
  })

  const queryKey = ['subtasks', taskId]

  const { mutate: updateSubtaskStatus, isPending: isUpdatingSubtaskStatus } = useMutation({
    mutationFn: subtaskService.updateSubtaskStatus,
    onMutate: async (variables) => {
      if (!taskId) return

      await queryClient.cancelQueries({ queryKey })
      const previousData = queryClient.getQueryData<BasePaginationResponse<Subtask>>(queryKey)

      if (previousData) {
        queryClient.setQueryData<BasePaginationResponse<Subtask>>(queryKey, (old) => {
          if (!old) return old

          const newItems = old.value.items.map((item) =>
            item.id === variables.body.id ? { ...item, isCompleted: variables.body.isCompleted } : item
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

  return { methods, updateSubtaskStatus, isUpdatingSubtaskStatus }
}
