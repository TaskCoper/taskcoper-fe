import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { getErrorDescription } from '../../products/error-description'
import { cardTemplateKeys } from '../query-keys'
import cardTemplateService from '../services'
import type { CreateCardTemplatePayload } from '../types'
import { CardTemplateType } from '../types'
import { createCardTemplateSchema, type CreateCardTemplateFormValues } from '../validations'

const DEFAULT_VALUES: CreateCardTemplateFormValues = {
  name: '',
  description: '',
  imageFile: undefined as unknown as File,
  templateType: CardTemplateType.Handmade
}

export const useCreateCardTemplate = () => {
  const { t } = useTenantTranslation()
  const queryClient = useQueryClient()
  const methods = useForm<CreateCardTemplateFormValues>({
    resolver: zodResolver(createCardTemplateSchema(t)),
    defaultValues: DEFAULT_VALUES
  })
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

  return { createCardTemplate, isCreatingCardTemplate, methods }
}
