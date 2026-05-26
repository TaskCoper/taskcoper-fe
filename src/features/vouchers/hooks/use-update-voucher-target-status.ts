import { queryKeys } from '@/lib/query-keys'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import voucherService from '../services'

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
      queryClient.invalidateQueries({ queryKey: queryKeys.vouchers.lists() })
      queryClient.invalidateQueries({ queryKey: queryKeys.vouchers.detail(voucherId), exact: true })
      queryClient.invalidateQueries({ queryKey: queryKeys.vouchers.targetStats() })
    }
  })

  return { updateVoucherTargetStatus, isUpdatingVoucherTargetStatus }
}
