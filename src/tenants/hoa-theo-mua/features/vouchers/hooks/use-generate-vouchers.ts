import { useMutation } from '@tanstack/react-query'
import voucherService from '../services'
import type { GenerateVouchersPayload } from '../types'
import { useVoucherMutationFeedback } from './use-voucher-mutation-feedback'

export const useGenerateVouchers = () => {
  const { invalidate, onError } = useVoucherMutationFeedback()
  const { mutate: generateVouchers, isPending: isGeneratingVouchers } = useMutation({
    mutationFn: ({ programId, payload }: { programId: string; payload: GenerateVouchersPayload }) =>
      voucherService.generateVouchers(programId, payload),
    onSuccess: invalidate,
    onError
  })

  return { generateVouchers, isGeneratingVouchers }
}
