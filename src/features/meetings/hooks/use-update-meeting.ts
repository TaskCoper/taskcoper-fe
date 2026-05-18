import { queryKeys } from '@/lib/query-keys'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import meetingService from '../services'

interface UseUpdateMeetingOptions {
  packageId?: string
  mentorId: string
  showSuccessToast?: boolean
}

export const useUpdateMeeting = ({ packageId, mentorId, showSuccessToast = true }: UseUpdateMeetingOptions) => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  const { mutate: updateMeeting, isPending: isUpdatingMeeting } = useMutation({
    mutationFn: meetingService.updateMeeting,
    onSuccess: (message) => {
      if (showSuccessToast) {
        toast.success(message)
      }
    },
    onError: (error) => {
      toast.error(t('error.somethingWentWrong'), {
        description: error.response?.data?.detail
      })
    },
    onSettled: (_, _error, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.meetings.allMy() })
      queryClient.invalidateQueries({ queryKey: queryKeys.meetings.detail(variables.body.meetingId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.meetings.allMentor(mentorId) })

      if (packageId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.mentorPackages.purchasedDetail(packageId) })
      }
    }
  })

  return { updateMeeting, isUpdatingMeeting }
}
