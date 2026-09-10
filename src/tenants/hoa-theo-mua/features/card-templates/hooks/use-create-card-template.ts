import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { getErrorDescription } from '../../products/error-description'
import { cardTemplateKeys } from '../query-keys'
import cardTemplateService from '../services'
import type { CreateCardTemplatePayload } from '../types'

export const useCreateCardTemplate = () => {
  const { t } = useTenantTranslation()
  const queryClient = useQueryClient()
  const { mutate: createCardTemplate, isPending: isCreatingCardTemplate } = useMutation({
    mutationFn: (payload: CreateCardTemplatePayload) => cardTemplateService.addCardTemplate(payload),
    onSuccess: () => {
      toast.success(t('cardTemplates.form.createSuccess'))
    },
    onError: (error) => {
      toast.error(t('error.somethingWentWrong'), {
        description: getErrorDescription(error.response?.data) || t('cardTemplates.form.createFailed')
      })
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: cardTemplateKeys.lists() })
  })

  return { createCardTemplate, isCreatingCardTemplate }
}
