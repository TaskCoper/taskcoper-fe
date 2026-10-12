import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import voucherService from '../services'
import type { VoucherProgram } from '../types'
import { useVoucherMutationFeedback } from './use-voucher-mutation-feedback'

export const useSetVoucherProgramActive = () => {
  const { t } = useTenantTranslation()
  const { invalidate, onError } = useVoucherMutationFeedback()
  const { mutate: setVoucherProgramActive, isPending: isSettingVoucherProgramActive } = useMutation({
    mutationFn: ({ program, isActive }: { program: VoucherProgram; isActive: boolean }) =>
      voucherService.updateProgram({
        id: program.id,
        name: program.name,
        startAt: program.startAt,
        endAt: program.endAt ?? '',
        minOrderAmount: program.minOrderAmount,
        maxOrderAmount: program.maxOrderAmount,
        isActive
      }),
    onSuccess: (_, { isActive }) => {
      toast.success(t(`configsPage.vouchers.programStatusAction.${isActive ? 'activateSuccess' : 'deactivateSuccess'}`))
      invalidate()
    },
    onError
  })

  return { setVoucherProgramActive, isSettingVoucherProgramActive }
}
