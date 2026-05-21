import { queryKeys } from '@/lib/query-keys'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import packageBookingService from '../services'

export const useCancelRequest = ({ packageId }: { packageId?: string }) => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  const { mutate: cancelRequest, isPending: isCancellingRequest } = useMutation({
    mutationFn: packageBookingService.cancelRequest,
    onSuccess: (message) => {
      toast.success(message)
    },
    onError: (error) => {
      toast(t('error.somethingWentWrong'), {
        description: error.response?.data?.detail
      })
    },
    onSettled: (_, _error, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.mentorPackages.requests.allMyOutgoing() })
      queryClient.invalidateQueries({
        queryKey: queryKeys.mentorPackages.requests.detailOutgoing(variables.requestId)
      })

      if (packageId) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.mentorPackages.detail(packageId)
        })
      }
    }
  })

  return { cancelRequest, isCancellingRequest }
}
