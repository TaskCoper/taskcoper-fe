import { useMutation } from '@tanstack/react-query'
import voucherService from '../services'
import type { CreateProgramPayload } from '../types'
import { useVoucherMutationFeedback } from './use-voucher-mutation-feedback'

export const useCreateVoucherProgram = () => {
  const { invalidate, onError } = useVoucherMutationFeedback()
  const { mutate: createVoucherProgram, isPending: isCreatingVoucherProgram } = useMutation({
    mutationFn: (payload: CreateProgramPayload) => voucherService.createProgram(payload),
    onSuccess: invalidate,
    onError
  })

  return { createVoucherProgram, isCreatingVoucherProgram }
}
