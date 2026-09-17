import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { getErrorDescription } from '../../products/error-description'
import { cardTemplateKeys } from '../query-keys'
import cardTemplateService from '../services'
import type { UpdateCardTemplatePayload } from '../types'

export const useUpdateCardTemplate = () => {
  const { t } = useTenantTranslation()
  const queryClient = useQueryClient()
  const { mutate: updateCardTemplate, isPending: isUpdatingCardTemplate } = useMutation({
    mutationFn: (payload: UpdateCardTemplatePayload) => cardTemplateService.updateCardTemplate(payload.id, payload),
    onSuccess: () => {
      toast.success(t('cardTemplates.form.updateSuccess'))
    },
    onError: (error) => {
      toast.error(t('error.somethingWentWrong'), {
        description: getErrorDescription(error.response?.data) || t('cardTemplates.form.updateFailed')
      })
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: cardTemplateKeys.lists() })
  })

  return { updateCardTemplate, isUpdatingCardTemplate }
}
