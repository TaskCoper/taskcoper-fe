import { useMutation } from '@tanstack/react-query'
import voucherService from '../services'
import { useVoucherMutationFeedback } from './use-voucher-mutation-feedback'

export const useSetVouchersActive = () => {
  const { invalidate, onError } = useVoucherMutationFeedback()
  const { mutate: setVouchersActive, isPending: isSettingVouchersActive } = useMutation({
    mutationFn: ({ ids, isActive }: { ids: string[]; isActive: boolean }) =>
      voucherService.setVouchersActive(ids, isActive),
    onSuccess: invalidate,
    onError
  })

  return { setVouchersActive, isSettingVouchersActive }
}
