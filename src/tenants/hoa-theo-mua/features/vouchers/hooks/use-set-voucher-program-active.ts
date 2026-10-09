import { useMutation } from '@tanstack/react-query'
import voucherService from '../services'
import { useVoucherMutationFeedback } from './use-voucher-mutation-feedback'

export const useSetVoucherProgramActive = () => {
  const { invalidate, onError } = useVoucherMutationFeedback()
  const { mutate: setVoucherProgramActive, isPending: isSettingVoucherProgramActive } = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => voucherService.updateProgram({ id, isActive }),
    onSuccess: invalidate,
    onError
  })

  return { setVoucherProgramActive, isSettingVoucherProgramActive }
}
