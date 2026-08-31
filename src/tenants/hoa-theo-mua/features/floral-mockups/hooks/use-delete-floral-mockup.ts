import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { softDeleteMockFloralMockup } from '../mock-data'
import { floralMockupKeys } from '../query-keys'

export const useDeleteFloralMockup = () => {
  const { t } = useTenantTranslation()
  const queryClient = useQueryClient()
  const {
    mutate: deleteFloralMockup,
    isPending: isDeletingFloralMockup,
    isError: isDeleteFloralMockupError,
    reset: resetDeleteFloralMockup
  } = useMutation({
    mutationFn: softDeleteMockFloralMockup,
    onSuccess: () => {
      toast.success(t('floralMockups.deleteAction.success'))
      void queryClient.invalidateQueries({ queryKey: floralMockupKeys.lists() })
    },
    onError: () => {
      toast.error(t('floralMockups.deleteAction.failed'))
    }
  })

  return {
    deleteFloralMockup,
    isDeletingFloralMockup,
    isDeleteFloralMockupError,
    resetDeleteFloralMockup
  }
}
