import { queryKeys } from '@/lib/query-keys'
import scheduleService from '@/services/schedule.service'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { createSchedulesSchema, type CreateSchedulesFormValues } from '../validations'

const defaultValues: CreateSchedulesFormValues = {
  dayOfWeeks: [],
  activeFrom: null,
  activeTo: null,
  startTime: '',
  endTime: '',
  isActive: false
}

export const useCreateSchedules = () => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  const methods = useForm<CreateSchedulesFormValues>({
    defaultValues,
    resolver: zodResolver(createSchedulesSchema(t))
  })

  const { mutate: createSchedules, isPending: isCreatingSchedules } = useMutation({
    mutationFn: scheduleService.createSchedules,
    onSuccess: (message) => {
      methods.reset()
      toast.success(message)
    },
    onError: (error) => {
      toast(t('error.somethingWentWrong'), {
        description: error.response?.data?.detail
      })
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.schedules.my() })
    }
  })

  return { methods, createSchedules, isCreatingSchedules }
}
