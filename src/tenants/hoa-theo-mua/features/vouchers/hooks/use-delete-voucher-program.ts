import { useMutation } from '@tanstack/react-query'
import voucherService from '../services'
import { useVoucherMutationFeedback } from './use-voucher-mutation-feedback'

export const useDeleteVoucherProgram = () => {
  const { invalidate, onError } = useVoucherMutationFeedback()
  const { mutate: deleteVoucherProgram, isPending: isDeletingVoucherProgram } = useMutation({
    mutationFn: (programId: string) => voucherService.deleteProgram(programId),
    onSuccess: invalidate,
    onError
  })

  return { deleteVoucherProgram, isDeletingVoucherProgram }
}
