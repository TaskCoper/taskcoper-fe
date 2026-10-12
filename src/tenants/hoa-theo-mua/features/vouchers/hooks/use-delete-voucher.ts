import { useMutation } from '@tanstack/react-query'
import voucherService from '../services'
import { useVoucherMutationFeedback } from './use-voucher-mutation-feedback'

export const useDeleteVoucher = () => {
  const { invalidate, onError } = useVoucherMutationFeedback()
  const { mutate: deleteVoucher, isPending: isDeletingVoucher } = useMutation({
    mutationFn: (voucherId: string) => voucherService.deleteVoucher(voucherId),
    onSuccess: invalidate,
    onError
  })

  return { deleteVoucher, isDeletingVoucher }
}
