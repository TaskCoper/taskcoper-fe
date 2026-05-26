import { queryKeys } from '@/lib/query-keys'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import voucherService from '../services'

export const useDeleteVoucherTarget = () => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  const { mutate: deleteVoucherTarget, isPending: isDeletingVoucherTarget } = useMutation({
    mutationFn: voucherService.deleteVoucherTarget,
    onSuccess: (message) => {
      toast.success(message)
    },
    onError: (error) => {
      toast.error(t('error.somethingWentWrong'), {
        description: error.response?.data?.detail
      })
    },
    onSettled: (_, _error, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.vouchers.lists() })
      queryClient.invalidateQueries({ queryKey: queryKeys.vouchers.detail(variables.voucherId), exact: true })
      queryClient.invalidateQueries({ queryKey: queryKeys.vouchers.targetStats() })
    }
  })

  return { deleteVoucherTarget, isDeletingVoucherTarget }
}
