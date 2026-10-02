import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useForm } from 'react-hook-form'
import { cardTemplateKeys } from '../query-keys'
import cardTemplateService from '../services'
import type { CardTemplateListItem } from '../types'
import { updateCardTemplateSchema, type UpdateCardTemplateFormValues } from '../validations'

export const useUpdateCardTemplate = (template: CardTemplateListItem) => {
  const { t } = useTenantTranslation()
  const queryClient = useQueryClient()
  const methods = useForm<UpdateCardTemplateFormValues>({
    resolver: zodResolver(updateCardTemplateSchema(t)),
    defaultValues: {
      name: template.name,
      description: template.description ?? '',
      imageFile: null
    }
  })
  const { mutate: updateCardTemplate, isPending: isUpdatingCardTemplate } = useMutation({
    mutationFn: cardTemplateService.updateCardTemplate,
    onSuccess: () => {
      toast.success(t('cardTemplates.form.updateSuccess'))
    },
    onError: (error) => {
      toast.error(t('error.somethingWentWrong'), {
        description: error.response?.data?.detail
      })
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: cardTemplateKeys.lists() })
  })

  return { methods, updateCardTemplate, isUpdatingCardTemplate }
}
