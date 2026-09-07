import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { getErrorDescription } from '../../products/error-description'
import { deleteMockCardTemplate } from '../mock-data'
import { cardTemplateKeys } from '../query-keys'
import cardTemplateService from '../services'

export const useDeleteCardTemplate = () => {
  const { t } = useTenantTranslation()
  const queryClient = useQueryClient()
  const {
    mutate: deleteCardTemplate,
    isPending: isDeletingCardTemplate,
    isError: isDeleteCardTemplateError,
    reset: resetDeleteCardTemplate
  } = useMutation({
    mutationFn: async (id: string) => {
      try {
        return await cardTemplateService.deleteCardTemplate(id)
      } catch {
        return deleteMockCardTemplate(id)
      }
    },
    onSuccess: () => {
      toast.success(t('cardTemplates.deleteAction.success'))
    },
    onError: (error) => {
      toast.error(t('error.somethingWentWrong'), {
        description: getErrorDescription(error.response?.data) || t('cardTemplates.deleteAction.failed')
      })
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: cardTemplateKeys.lists() })
  })

  return {
    deleteCardTemplate,
    isDeletingCardTemplate,
    isDeleteCardTemplateError,
    resetDeleteCardTemplate
  }
}
