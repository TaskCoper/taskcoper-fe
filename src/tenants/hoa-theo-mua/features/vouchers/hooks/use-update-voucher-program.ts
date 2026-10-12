import { useMutation } from '@tanstack/react-query'
import voucherService from '../services'
import type { UpdateProgramPayload } from '../types'
import { useVoucherMutationFeedback } from './use-voucher-mutation-feedback'

export const useUpdateVoucherProgram = () => {
  const { invalidate, onError } = useVoucherMutationFeedback()
  const { mutate: updateVoucherProgram, isPending: isUpdatingVoucherProgram } = useMutation({
    mutationFn: (payload: UpdateProgramPayload) => voucherService.updateProgram(payload),
    onSuccess: invalidate,
    onError
  })

  return { updateVoucherProgram, isUpdatingVoucherProgram }
}
