import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import voucherService from '../services'
import { useVoucherMutationFeedback } from './use-voucher-mutation-feedback'

export const useSetVouchersActive = () => {
  const { t } = useTenantTranslation()
  const { invalidate, onError } = useVoucherMutationFeedback()
  const { mutate: setVouchersActive, isPending: isSettingVouchersActive } = useMutation({
    mutationFn: ({ ids, isActive }: { ids: string[]; isActive: boolean }) =>
      voucherService.setVouchersActive(ids, isActive),
    onSuccess: (_, { isActive }) => {
      toast.success(t(`configsPage.vouchers.voucherStatusAction.${isActive ? 'activateSuccess' : 'deactivateSuccess'}`))
      invalidate()
    },
    onError
  })

  return { setVouchersActive, isSettingVouchersActive }
}
