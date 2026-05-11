import meetingService from '@/features/meetings/services'
import { queryKeys } from '@/lib/query-keys'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

export const useCompleteMeeting = () => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  const { mutate: completeMeeting, isPending: isCompletingMeeting } = useMutation({
    mutationFn: meetingService.completeMeeting,
    onSuccess: (message) => {
      toast.success(message)
    },
    onError: (error) => {
      toast.error(t('error.somethingWentWrong'), {
        description: error.response?.data?.detail
      })
    },
    onSettled: (_, _error, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.meetings.allMy })
      queryClient.invalidateQueries({ queryKey: queryKeys.meetings.detail(variables.meetingId) })
    }
  })

  return { completeMeeting, isCompletingMeeting }
}
