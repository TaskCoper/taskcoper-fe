import { queryKeys } from '@/lib/query-keys'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'
import { toast } from 'sonner'
import feedbackService from '../services'
import { calculatePackageFeedbackRating } from '../utils'
import { submitPackageFeedbackSchema, type SubmitPackageFeedbackFormValues } from '../validations'

const defaultMetadata: SubmitPackageFeedbackFormValues['metadata'] = {
  punctuality: '4',
  preparation: '4',
  quality: '4',
  communication: '4',
  actionability: '4'
}

const defaultValues: SubmitPackageFeedbackFormValues = {
  metadata: defaultMetadata,
  rating: calculatePackageFeedbackRating(defaultMetadata),
  targetId: '',
  targetType: 'MentorPackageBooking',
  comment: ''
}

export const useSubmitPackageFeedback = ({ packageId }: { packageId?: string }) => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  const methods = useForm<SubmitPackageFeedbackFormValues>({
    defaultValues,
    resolver: zodResolver(submitPackageFeedbackSchema(t))
  })

  const { mutate: submitFeedback, isPending: isSubmittingFeedback } = useMutation({
    mutationFn: feedbackService.submitFeedback,
    onSuccess: (message) => {
      toast.success(message)
      methods.reset()
      navigate(-1)
    },
    onError: (error) => {
      toast(t('error.somethingWentWrong'), {
        description: error.response?.data?.detail
      })
    },
    onSettled: (_, _error, variables) => {
      if (variables.body.targetId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.feedbacks.byPackage(variables.body.targetId) })
      }
      queryClient.invalidateQueries({ queryKey: queryKeys.feedbacks.lists() })

      if (packageId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.mentorPackages.purchasedDetail(packageId) })
      }
    }
  })

  return {
    methods,
    submitFeedback,
    isSubmittingFeedback
  }
}
