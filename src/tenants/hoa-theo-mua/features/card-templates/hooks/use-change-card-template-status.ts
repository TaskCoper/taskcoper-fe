import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { cardTemplateKeys } from '../query-keys'
import cardTemplateService from '../services'
import type { ChangeCardTemplateStatusPayload } from '../types'

export const useChangeCardTemplateStatus = () => {
  const { t } = useTenantTranslation()
  const queryClient = useQueryClient()
  const { mutate: changeCardTemplateStatus, isPending: isChangingCardTemplateStatus } = useMutation({
    mutationFn: async (payload: ChangeCardTemplateStatusPayload) => {
      await cardTemplateService.changeCardTemplateStatus(payload.id, payload)
      return payload
    },
    onSuccess: ({ isActive }) => {
      toast.success(t(`cardTemplates.statusAction.${isActive ? 'activateSuccess' : 'deactivateSuccess'}`))
    },
    onError: (error) => {
      toast.error(t('error.somethingWentWrong'), {
        description: error.response?.data?.detail
      })
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: cardTemplateKeys.lists() })
  })

  return { changeCardTemplateStatus, isChangingCardTemplateStatus }
}
