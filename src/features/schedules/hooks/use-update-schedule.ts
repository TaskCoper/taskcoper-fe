import type { BasePaginationResponse } from '@/lib/axios'
import { queryKeys } from '@/lib/query-keys'
import scheduleService from '@/services/schedule.service'
import type { MeetingRule } from '@/types/schedule.type'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import type { UpdateScheduleFormValues } from '../validations'
import { updateScheduleSchema } from '../validations'

export const useUpdateSchedule = () => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  const methods = useForm<UpdateScheduleFormValues>({
    resolver: zodResolver(updateScheduleSchema(t))
  })

  const { mutate: updateSchedule, isPending: isUpdatingSchedule } = useMutation({
    mutationFn: scheduleService.updateSchedule,
    onMutate: async ({ id, body }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.schedules.allMy })

      const previousQueries = queryClient.getQueriesData<BasePaginationResponse<MeetingRule>>({
        queryKey: queryKeys.schedules.allMy
      })

      queryClient.setQueriesData<BasePaginationResponse<MeetingRule>>(
        { queryKey: queryKeys.schedules.allMy },
        (old) => {
          if (!old?.value?.items) return old

          return {
            ...old,
            value: {
              ...old.value,
              items: old.value.items.map((item) => {
                if (item.id === id) {
                  return { ...item, ...body }
                }
                return item
              })
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
      queryClient.invalidateQueries({ queryKey: queryKeys.schedules.allMy })
    }
  })

  return { methods, updateSchedule, isUpdatingSchedule }
}
