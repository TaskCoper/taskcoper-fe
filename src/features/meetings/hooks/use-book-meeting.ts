import { queryKeys } from '@/lib/query-keys'
import { useAuthStore } from '@/lib/zustand/auth.store'
import meetingService from '@/services/meeting.service'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { bookMeetingSchema, type BookMeetingFormValues } from '../validations'

export const useBookMeeting = () => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()
  const { user } = useAuthStore()

  const methods = useForm<BookMeetingFormValues>({
    defaultValues: {
      mentorId: '',
      bookingTimeSlots: [],
      bookByUserId: user?.UserId ?? '',
      bookByProjectId: null
    },
    resolver: zodResolver(bookMeetingSchema())
  })

  const { mutate: bookMeeting, isPending: isBookingMeeting } = useMutation({
    mutationFn: meetingService.bookMeeting,
    onSuccess: (message) => {
      toast.success(message)
    },
    onError: (error) => {
      toast(t('error.somethingWentWrong'), {
        description: error.response?.data?.detail
      })
    },
    onSettled: (_, _error, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.meetings.allMentor(variables.body.mentorId) })
    }
  })

  return { methods, bookMeeting, isBookingMeeting }
}
