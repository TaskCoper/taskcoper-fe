import type { ErrorResponse } from '@/lib/axios'
import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { useQueryClient } from '@tanstack/react-query'
import type { AxiosError } from 'axios'
import { toast } from 'sonner'
import { getErrorDescription } from '../error-description'
import { voucherKeys } from './query-keys'

export const useVoucherMutationFeedback = () => {
  const { t } = useTenantTranslation()
  const queryClient = useQueryClient()

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: voucherKeys.vouchers() })
    void queryClient.invalidateQueries({ queryKey: voucherKeys.programs() })
  }

  const onError = (error: AxiosError<ErrorResponse>) => {
    toast.error(t('error.somethingWentWrong'), {
      description: getErrorDescription(error.response?.data)
    })
  }

  return { invalidate, onError }
}
