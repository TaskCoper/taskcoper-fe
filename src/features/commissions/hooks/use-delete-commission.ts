import { queryKeys } from '@/lib/query-keys'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import commissionService from '../services'

export const useDeleteCommission = () => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  const { mutate: deleteCommission, isPending: isDeletingCommission } = useMutation({
    mutationFn: commissionService.deleteCommission,
    onSuccess: (message) => {
      toast.success(message)
    },
    onError: (error) => {
      toast.error(t('error.somethingWentWrong'), {
        description: error.response?.data?.detail
      })
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.commissions.all })
    }
  })

  return { deleteCommission, isDeletingCommission }
}
