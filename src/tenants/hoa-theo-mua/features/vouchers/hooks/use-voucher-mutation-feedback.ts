import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { voucherKeys } from './query-keys'

export const useVoucherMutationFeedback = () => {
  const { t } = useTenantTranslation()
  const queryClient = useQueryClient()

  const invalidate = (result?: unknown) => {
    void queryClient.invalidateQueries({ queryKey: voucherKeys.vouchers() })
    void queryClient.invalidateQueries({ queryKey: voucherKeys.programs() })

    if (!result || typeof result !== 'object') return
    const bulkResult = result as { notFoundIds?: string[]; skippedItems?: Array<{ reason: string }> }
    const notFoundCount = bulkResult.notFoundIds?.length ?? 0
    const skippedCount = bulkResult.skippedItems?.length ?? 0
    if (notFoundCount === 0 && skippedCount === 0) return

    toast.warning(t('configsPage.vouchers.bulkPartialSuccess'), {
      description: t('configsPage.vouchers.bulkPartialSuccessDescription', { notFoundCount, skippedCount })
    })
  }

  const onError = (error: { response?: { data?: { detail?: string } } }) => {
    toast.error(t('error.somethingWentWrong'), { description: error.response?.data?.detail })
  }

  return { invalidate, onError }
}
