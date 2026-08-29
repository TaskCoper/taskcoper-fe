import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { createMockCardTemplate } from '../mock-data'
import { cardTemplateKeys } from '../query-keys'

export const useCreateCardTemplate = () => {
  const { t } = useTenantTranslation()
  const queryClient = useQueryClient()
  const { mutate: createCardTemplate, isPending: isCreatingCardTemplate } = useMutation({
    mutationFn: createMockCardTemplate,
    onSuccess: () => {
      toast.success(t('cardTemplates.form.createSuccess'))
      void queryClient.invalidateQueries({ queryKey: cardTemplateKeys.lists() })
    },
    onError: () => {
      toast.error(t('cardTemplates.form.createFailed'))
    }
  })

  return { createCardTemplate, isCreatingCardTemplate }
}
