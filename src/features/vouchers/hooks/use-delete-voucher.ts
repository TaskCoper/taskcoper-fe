import { queryKeys } from '@/lib/query-keys'
import voucherService from '@/services/voucher.service'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

export const useDeleteVoucher = () => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  const { mutate: deleteVoucher, isPending: isDeletingVoucher } = useMutation({
    mutationFn: voucherService.deleteVoucher,
    onSuccess: (message) => {
      toast.success(message)
    },
    onError: (error) => {
      toast.error(t('error.somethingWentWrong'), {
        description: error.response?.data?.detail
      })
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.vouchers.all })
    }
  })

  return { deleteVoucher, isDeletingVoucher }
}
