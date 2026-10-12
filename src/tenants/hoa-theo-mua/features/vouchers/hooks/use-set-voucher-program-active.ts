import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import voucherService from '../services'
import { useVoucherMutationFeedback } from './use-voucher-mutation-feedback'

export const useSetVoucherProgramActive = () => {
  const { t } = useTenantTranslation()
  const { invalidate, onError } = useVoucherMutationFeedback()
  const { mutate: setVoucherProgramActive, isPending: isSettingVoucherProgramActive } = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => voucherService.updateProgram({ id, isActive }),
    onSuccess: (_, { isActive }) => {
      toast.success(t(`configsPage.vouchers.programStatusAction.${isActive ? 'activateSuccess' : 'deactivateSuccess'}`))
      invalidate()
    },
    onError
  })

  return { setVoucherProgramActive, isSettingVoucherProgramActive }
}
