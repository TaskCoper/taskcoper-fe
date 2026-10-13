import { useMutation } from '@tanstack/react-query'
import voucherService from '../services'
import type { UpdateVoucherItem } from '../types'
import { useVoucherMutationFeedback } from './use-voucher-mutation-feedback'

export const useUpdateVouchers = () => {
  const { invalidate, onError } = useVoucherMutationFeedback()
  const { mutate: updateVouchers, isPending: isUpdatingVouchers } = useMutation({
    mutationFn: (items: UpdateVoucherItem[]) => voucherService.updateVouchers(items),
    onSuccess: invalidate,
    onError
  })

  return { updateVouchers, isUpdatingVouchers }
}
