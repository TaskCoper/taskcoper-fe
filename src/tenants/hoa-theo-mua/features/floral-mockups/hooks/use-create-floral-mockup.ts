import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { floralMockupKeys } from '../query-keys'
import type { CreateFloralMockupPayload } from '../types'
import floralMockupService from '../services'

export const useCreateFloralMockup = () => {
  const { t } = useTenantTranslation()
  const queryClient = useQueryClient()
  const { mutateAsync: createFloralMockup, isPending: isCreatingFloralMockup } = useMutation({
    mutationFn: (payload: CreateFloralMockupPayload) => floralMockupService.addFloralMockup(payload),
    onSuccess: () => {
      toast.success(t('floralMockups.form.createSuccess'))
    },
    onError: () => {
      toast.error(t('error.somethingWentWrong'), {
        description: t('floralMockups.form.createFailed')
      })
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: floralMockupKeys.lists() })
    }
  })

  return { createFloralMockup, isCreatingFloralMockup }
}
