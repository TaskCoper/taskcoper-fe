import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { updateMockCardTemplate } from '../mock-data'
import { cardTemplateKeys } from '../query-keys'

export const useUpdateCardTemplate = () => {
  const { t } = useTenantTranslation()
  const queryClient = useQueryClient()
  const { mutate: updateCardTemplate, isPending: isUpdatingCardTemplate } = useMutation({
    mutationFn: updateMockCardTemplate,
    onSuccess: () => {
      toast.success(t('cardTemplates.form.updateSuccess'))
      void queryClient.invalidateQueries({ queryKey: cardTemplateKeys.lists() })
    },
    onError: () => {
      toast.error(t('cardTemplates.form.updateFailed'))
    }
  })

  return { updateCardTemplate, isUpdatingCardTemplate }
}
