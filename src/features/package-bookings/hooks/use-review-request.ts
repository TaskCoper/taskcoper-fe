import { queryKeys } from '@/lib/query-keys'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import packageBookingService from '../services'
import { reviewPackageSchema, type ReviewPackageFormValues } from '../validations'

export const useReviewRequest = () => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  const methods = useForm<ReviewPackageFormValues>({
    resolver: zodResolver(reviewPackageSchema(t))
  })

  const { mutate: reviewRequest, isPending: isReviewingRequest } = useMutation({
    mutationFn: packageBookingService.reviewRequest,
    onSuccess: (message) => {
      toast.success(message)
    },
    onError: (error) => {
      toast(t('error.somethingWentWrong'), {
        description: error.response?.data?.detail
      })
    },
    onSettled: (_, _error, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.mentorPackages.requests.allMyIncoming() })
      queryClient.invalidateQueries({
        queryKey: queryKeys.mentorPackages.requests.detailIncoming(variables.body.requestId)
      })
    }
  })

  return { methods, reviewRequest, isReviewingRequest }
}
