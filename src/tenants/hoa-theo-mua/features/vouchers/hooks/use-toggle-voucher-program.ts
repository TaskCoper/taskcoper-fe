import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { useConfirmStore } from '@/lib/zustand/confirm.store'
import { useCallback } from 'react'
import type { VoucherProgram } from '../types'
import { useSetVoucherProgramActive } from './use-set-voucher-program-active'

export const useToggleVoucherProgram = () => {
  const { t } = useTenantTranslation()
  const { confirm } = useConfirmStore()
  const { setVoucherProgramActive, isSettingVoucherProgramActive } = useSetVoucherProgramActive()

  const toggleVoucherProgram = useCallback(
    async (program: VoucherProgram, isActive: boolean) => {
      const action = isActive ? 'activate' : 'deactivate'
      const confirmed = await confirm({
        title: t(`configsPage.vouchers.programStatusAction.${action}Title`),
        description: t(`configsPage.vouchers.programStatusAction.${action}Description`, {
          name: program.name,
          count: program.voucherCount
        }),
        confirmText: t('configsPage.vouchers.programStatusAction.confirm')
      })

      if (confirmed) setVoucherProgramActive({ program, isActive })
    },
    [confirm, setVoucherProgramActive, t]
  )

  return { toggleVoucherProgram, isTogglingVoucherProgram: isSettingVoucherProgramActive }
}
