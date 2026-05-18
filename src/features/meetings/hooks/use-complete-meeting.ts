import { queryKeys } from '@/lib/query-keys'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import meetingService from '../services'

interface UseCompleteMeetingOptions {
  mentorId?: string
  projectIdentifier?: string
}

export const useCompleteMeeting = ({ mentorId, projectIdentifier }: UseCompleteMeetingOptions = {}) => {
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
      queryClient.invalidateQueries({ queryKey: queryKeys.meetings.allMy() })
      queryClient.invalidateQueries({ queryKey: queryKeys.meetings.detail(variables.meetingId) })

      if (mentorId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.meetings.allMentor(mentorId) })
      }

      if (projectIdentifier) {
        queryClient.invalidateQueries({ queryKey: queryKeys.meetings.allProject(projectIdentifier) })
      }
    }
  })

  return { completeMeeting, isCompletingMeeting }
}
