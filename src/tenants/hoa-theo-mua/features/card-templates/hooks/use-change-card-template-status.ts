import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { changeMockCardTemplateStatus } from '../mock-data'
import { cardTemplateKeys } from '../query-keys'

export const useChangeCardTemplateStatus = () => {
  const { t } = useTenantTranslation()
  const queryClient = useQueryClient()
  const { mutate: changeCardTemplateStatus, isPending: isChangingCardTemplateStatus } = useMutation({
    mutationFn: changeMockCardTemplateStatus,
    onSuccess: (template) => {
      toast.success(t(`cardTemplates.statusAction.${template.isActive ? 'activateSuccess' : 'deactivateSuccess'}`))
      void queryClient.invalidateQueries({ queryKey: cardTemplateKeys.lists() })
    },
    onError: () => {
      toast.error(t('cardTemplates.statusAction.failed'))
    }
  })

  return { changeCardTemplateStatus, isChangingCardTemplateStatus }
}
