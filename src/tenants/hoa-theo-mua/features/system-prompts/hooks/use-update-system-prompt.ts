import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { AxiosError } from 'axios'
import { toast } from 'sonner'
import { getErrorDescription } from '../../products/error-description'
import { systemPromptKeys } from '../query-keys'
import systemPromptService from '../services'
import type { UpdateSystemPromptBody } from '../types'

interface UpdateSystemPromptVariables {
  id: string
  body: UpdateSystemPromptBody
}

export const useUpdateSystemPrompt = () => {
  const { t } = useTenantTranslation()
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: ({ id, body }: UpdateSystemPromptVariables) => systemPromptService.updateSystemPrompt(id, body),
    onSuccess: (systemPrompt) => {
      queryClient.setQueryData(systemPromptKeys.detail(systemPrompt.id), systemPrompt)
      void queryClient.invalidateQueries({ queryKey: systemPromptKeys.list() })
      toast.success(t('systemPrompts.toast.updateSuccess'))
    },
    onError: (error: AxiosError) => {
      toast.error(t('systemPrompts.toast.updateFailed'), {
        description: getErrorDescription(error.response?.data)
      })
    }
  })

  return {
    updateSystemPrompt: mutation.mutateAsync,
    isUpdatingSystemPrompt: mutation.isPending
  }
}
