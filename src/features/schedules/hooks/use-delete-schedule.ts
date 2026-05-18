import type { BasePaginationResponse } from '@/lib/axios'
import { queryKeys } from '@/lib/query-keys'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import scheduleService from '../services'
import type { MeetingRule } from '../types'

export const useDeleteSchedule = () => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  const { mutate: deleteSchedule, isPending: isDeletingSchedule } = useMutation({
    mutationFn: scheduleService.deleteSchedule,
    onMutate: async ({ id }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.schedules.allMy() })

      const previousQueries = queryClient.getQueriesData<BasePaginationResponse<MeetingRule>>({
        queryKey: queryKeys.schedules.allMy()
      })

      queryClient.setQueriesData<BasePaginationResponse<MeetingRule>>(
        { queryKey: queryKeys.schedules.allMy() },
        (old) => {
          if (!old?.value?.items) return old

          return {
            ...old,
            value: {
              ...old.value,
              items: old.value.items.filter((item) => item.id !== id)
            }
          }
        }
      )

      return { previousQueries }
    },
    onSuccess: (message) => {
      toast.success(message)
    },
    onError: (error, _variables, context) => {
      if (context?.previousQueries) {
        context.previousQueries.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data)
        })
      }
      toast(t('error.somethingWentWrong'), {
        description: error.response?.data?.detail
      })
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.schedules.allMy() })
    }
  })

  return { deleteSchedule, isDeletingSchedule }
}
