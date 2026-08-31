import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { changeMockFloralMockupStatus } from '../mock-data'
import { floralMockupKeys } from '../query-keys'

export const useChangeFloralMockupStatus = () => {
  const { t } = useTenantTranslation()
  const queryClient = useQueryClient()
  const { mutate: changeFloralMockupStatus, isPending: isChangingFloralMockupStatus } = useMutation({
    mutationFn: changeMockFloralMockupStatus,
    onSuccess: (mockup) => {
      toast.success(t(`floralMockups.statusAction.${mockup.isActive ? 'activateSuccess' : 'deactivateSuccess'}`))
      void queryClient.invalidateQueries({ queryKey: floralMockupKeys.lists() })
    },
    onError: () => {
      toast.error(t('floralMockups.statusAction.failed'))
    }
  })

  return { changeFloralMockupStatus, isChangingFloralMockupStatus }
}
