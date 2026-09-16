import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { getErrorDescription } from '../../products/error-description'
import { cardTemplateKeys } from '../query-keys'
import cardTemplateService from '../services'
import type { UpdateCardTemplatePayload } from '../types'
import type { CardTemplateListItem } from '../types'
import { updateCardTemplateSchema, type UpdateCardTemplateFormValues } from '../validations'

export const useUpdateCardTemplate = (template: CardTemplateListItem | null, open: boolean) => {
  const { t } = useTenantTranslation()
  const queryClient = useQueryClient()
  const methods = useForm<UpdateCardTemplateFormValues>({
    resolver: zodResolver(updateCardTemplateSchema(t)),
    defaultValues: { name: '', description: '', imageFile: null }
  })

  useEffect(() => {
    if (!open || !template) return
    methods.reset({ name: template.name, description: template.description ?? '', imageFile: null })
  }, [methods, open, template])
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

  return { updateCardTemplate, isUpdatingCardTemplate, methods }
}
