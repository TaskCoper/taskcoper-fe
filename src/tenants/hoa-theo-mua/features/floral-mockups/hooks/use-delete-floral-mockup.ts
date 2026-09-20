import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { floralMockupKeys } from '../query-keys'
import floralMockupService from '../services'
import type { DeleteFloralMockupPayload } from '../types'

export const useDeleteFloralMockup = () => {
  const { t } = useTenantTranslation()
  const queryClient = useQueryClient()
  const {
    mutate: deleteFloralMockup,
    isPending: isDeletingFloralMockup,
    isError: isDeleteFloralMockupError,
    reset: resetDeleteFloralMockup
  } = useMutation({
    mutationFn: (payload: DeleteFloralMockupPayload) => floralMockupService.deleteFloralMockup(payload.id),
    onSuccess: () => {
      toast.success(t('floralMockups.deleteAction.success'))
    },
    onError: () => {
      toast.error(t('error.somethingWentWrong'), {
        description: t('floralMockups.deleteAction.failed')
      })
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: floralMockupKeys.lists() })
    }
  })

  return {
    deleteFloralMockup,
    isDeletingFloralMockup,
    isDeleteFloralMockupError,
    resetDeleteFloralMockup
  }
}
