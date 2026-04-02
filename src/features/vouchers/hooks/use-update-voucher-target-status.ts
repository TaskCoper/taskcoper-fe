import { queryKeys } from '@/lib/query-keys'
import voucherService from '@/services/voucher.service'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

export const useUpdateVoucherTargetStatus = ({ voucherId }: { voucherId: string }) => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  const { mutate: updateVoucherTargetStatus, isPending: isUpdatingVoucherTargetStatus } = useMutation({
    mutationFn: voucherService.updateVoucherTargetStatus,
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
      queryClient.invalidateQueries({ queryKey: queryKeys.vouchers.detail(voucherId) })
    }
  })

  return { updateVoucherTargetStatus, isUpdatingVoucherTargetStatus }
}
