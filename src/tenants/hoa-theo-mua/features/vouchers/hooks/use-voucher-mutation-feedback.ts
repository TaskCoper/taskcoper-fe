import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { voucherKeys } from './query-keys'

export const useVoucherMutationFeedback = () => {
  const { t } = useTenantTranslation()
  const queryClient = useQueryClient()

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: voucherKeys.vouchers() })
    void queryClient.invalidateQueries({ queryKey: voucherKeys.programs() })
  }

  const onError = (error: { response?: { data?: { detail?: string; errors?: { detail?: string } } } }) => {
    toast.error(t('error.somethingWentWrong'), {
      description: error.response?.data?.errors?.detail ?? error.response?.data?.detail
    })
  }

  return { invalidate, onError }
}
