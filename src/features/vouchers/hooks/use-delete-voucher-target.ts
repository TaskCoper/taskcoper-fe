import { queryKeys } from '@/lib/query-keys'
import voucherService from '@/services/voucher.service'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

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
      queryClient.invalidateQueries({ queryKey: queryKeys.vouchers.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.vouchers.detail(variables.voucherId) })
    }
  })

  return { deleteVoucherTarget, isDeletingVoucherTarget }
}
