import { queryKeys } from '@/lib/query-keys'
import meetingService from '@/services/meeting.service'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { AxiosError } from 'axios'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

export const useRescheduleMeeting = () => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  const { mutate: rescheduleMeeting, isPending: isReschedulingMeeting } = useMutation({
    mutationFn: meetingService.rescheduleMeeting,
    onSuccess: (message) => {
      toast.success(message)
    },
    onError: (error: AxiosError<{ detail: string }>) => {
      toast.error(t('error.somethingWentWrong'), {
        description: error.response?.data?.detail
      })
    },
    onSettled: (_, _error, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.meetings.allMy })
      queryClient.invalidateQueries({ queryKey: queryKeys.meetings.detail(variables.body.meetingId) })
    }
  })

  return { rescheduleMeeting, isReschedulingMeeting }
}
