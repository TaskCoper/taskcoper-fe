import { useMutation } from '@tanstack/react-query'
import voucherService from '../services'
import type { CreateVoucherPayload } from '../types'
import { useVoucherMutationFeedback } from './use-voucher-mutation-feedback'

export const useCreateVoucher = () => {
  const { invalidate, onError } = useVoucherMutationFeedback()
  const { mutate: createVoucher, isPending: isCreatingVoucher } = useMutation({
    mutationFn: (payload: CreateVoucherPayload) => voucherService.createVoucher(payload),
    onSuccess: invalidate,
    onError
  })

  return { createVoucher, isCreatingVoucher }
}
