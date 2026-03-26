import { queryKeys } from '@/lib/query-keys'
import { useAuthStore } from '@/lib/zustand/auth.store'
import meetingService from '@/services/meeting.service'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { bookMeetingSchema, type BookMeetingFormValues } from '../validations'

interface UseBookMeetingOptions {
  packageId?: string
}

export const useBookMeeting = ({ packageId }: UseBookMeetingOptions = {}) => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()
  const { user } = useAuthStore()

  const methods = useForm<BookMeetingFormValues>({
    defaultValues: {
      mentorId: '',
      bookingTimeSlots: [],
      bookByUserId: user?.UserId ?? '',
      bookByProjectId: null,
      packageBookingId: null,
      packageSessionNumber: null
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
      queryClient.invalidateQueries({ queryKey: queryKeys.meetings.allMy })

      if (packageId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.mentorPackages.purchasedDetail(packageId) })
      }
    }
  })

  return { methods, bookMeeting, isBookingMeeting }
}
