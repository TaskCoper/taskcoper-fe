import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { deleteMockCardTemplate } from '../mock-data'
import { cardTemplateKeys } from '../query-keys'

export const useDeleteCardTemplate = () => {
  const { t } = useTenantTranslation()
  const queryClient = useQueryClient()
  const {
    mutate: deleteCardTemplate,
    isPending: isDeletingCardTemplate,
    isError: isDeleteCardTemplateError,
    reset: resetDeleteCardTemplate
  } = useMutation({
    mutationFn: deleteMockCardTemplate,
    onSuccess: () => {
      toast.success(t('cardTemplates.deleteAction.success'))
      void queryClient.invalidateQueries({ queryKey: cardTemplateKeys.lists() })
    },
    onError: () => {
      toast.error(t('cardTemplates.deleteAction.failed'))
    }
  })

  return {
    deleteCardTemplate,
    isDeletingCardTemplate,
    isDeleteCardTemplateError,
    resetDeleteCardTemplate
  }
}
