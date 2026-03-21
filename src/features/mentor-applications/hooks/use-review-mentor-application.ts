import { queryKeys } from '@/lib/query-keys'
import mentorApplicationService from '@/services/mentor-application.service'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { reviewMentorApplicationSchema, type ReviewMentorApplicationFormValues } from '../validations'

import { ApplicationStatus } from '@/types/mentor-application.type'

export const useReviewMentorApplication = () => {
  const { t } = useTranslation()
  const queryClient = useQueryClient()

  const methods = useForm<ReviewMentorApplicationFormValues>({
    resolver: zodResolver(reviewMentorApplicationSchema(t)),
    defaultValues: {
      applicationId: '',
      status: ApplicationStatus.IN_REVIEW,
      adminNote: '',
      titleLevel: null
    }
  })

  const { mutate: reviewMentorApplication, isPending: isReviewingMentorApplication } = useMutation({
    mutationFn: mentorApplicationService.reviewMentorApplication,
    onSuccess: (message) => {
      toast.success(message)
      methods.reset()
    },
    onError: (error) => {
      toast(t('error.somethingWentWrong'), {
        description: error.response?.data?.detail
      })
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.mentorApplications.all })
    }
  })

  return {
    methods,
    reviewMentorApplication,
    isReviewingMentorApplication
  }
}
