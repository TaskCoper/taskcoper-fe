import type { BasePaginationResponse } from '@/lib/axios'
import subtaskService from '@/services/subtask.service'
import type { Subtask } from '@/types/subtask.type'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

export const useDeleteSubtask = ({ taskId }: { taskId?: string } = {}) => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  const queryKey = ['subtasks', taskId]

  const { mutate: deleteSubtask, isPending: isDeletingSubtask } = useMutation({
    mutationFn: subtaskService.deleteSubtask,
    onMutate: async (variables) => {
      if (!taskId) return

      await queryClient.cancelQueries({ queryKey })
      const previousData = queryClient.getQueryData<BasePaginationResponse<Subtask>>(queryKey)

      if (previousData) {
        queryClient.setQueryData<BasePaginationResponse<Subtask>>(queryKey, (old) => {
          if (!old) return old

          const newItems = old.value.items.filter((item) => item.id !== variables.id)

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

  return { deleteSubtask, isDeletingSubtask }
}
