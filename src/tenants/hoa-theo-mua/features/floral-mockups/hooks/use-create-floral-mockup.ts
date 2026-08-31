import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { createMockFloralMockup } from '../mock-data'
import { floralMockupKeys } from '../query-keys'

export const useCreateFloralMockup = () => {
  const { t } = useTenantTranslation()
  const queryClient = useQueryClient()
  const { mutateAsync: createFloralMockup, isPending: isCreatingFloralMockup } = useMutation({
    mutationFn: createMockFloralMockup,
    onSuccess: () => {
      toast.success(t('floralMockups.form.createSuccess'))
      void queryClient.invalidateQueries({ queryKey: floralMockupKeys.lists() })
    },
    onError: () => {
      toast.error(t('floralMockups.form.createFailed'))
    }
  })

  return { createFloralMockup, isCreatingFloralMockup }
}
