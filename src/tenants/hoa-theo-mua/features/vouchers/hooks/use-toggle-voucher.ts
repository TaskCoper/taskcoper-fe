import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { useConfirmStore } from '@/lib/zustand/confirm.store'
import { useCallback } from 'react'
import type { Voucher } from '../types'
import { useSetVouchersActive } from './use-set-vouchers-active'

export const useToggleVoucher = () => {
  const { t } = useTenantTranslation()
  const { confirm } = useConfirmStore()
  const { setVouchersActive, isSettingVouchersActive } = useSetVouchersActive()

  const toggleVoucher = useCallback(
    async (voucher: Pick<Voucher, 'id' | 'code'>, isActive: boolean) => {
      const action = isActive ? 'activate' : 'deactivate'
      const confirmed = await confirm({
        title: t(`configsPage.vouchers.voucherStatusAction.${action}Title`),
        description: t(`configsPage.vouchers.voucherStatusAction.${action}Description`, { code: voucher.code }),
        confirmText: t('configsPage.vouchers.voucherStatusAction.confirm')
      })

      if (confirmed) setVouchersActive({ ids: [voucher.id], isActive })
    },
    [confirm, setVouchersActive, t]
  )

  return { toggleVoucher, isTogglingVoucher: isSettingVouchersActive }
}
