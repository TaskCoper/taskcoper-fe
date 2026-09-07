import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { changeMockFloralMockupStatus } from '../mock-data'
import { floralMockupKeys } from '../query-keys'
import floralMockupService from '../services'

export const useChangeFloralMockupStatus = () => {
  const { t } = useTenantTranslation()
  const queryClient = useQueryClient()
  const { mutate: changeFloralMockupStatus, isPending: isChangingFloralMockupStatus } = useMutation({
    mutationFn: async (payload: { id: string; isActive: boolean }) => {
      try {
        await floralMockupService.changeStatusFloralMockup(payload.id)
        return payload
      } catch {
        return changeMockFloralMockupStatus(payload)
      }
    },
    onSuccess: (mockup) => {
      toast.success(t(`floralMockups.statusAction.${mockup.isActive ? 'activateSuccess' : 'deactivateSuccess'}`))
    },
    onError: () => {
      toast.error(t('error.somethingWentWrong'), {
        description: t('floralMockups.statusAction.failed')
      })
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: floralMockupKeys.lists() })
    }
  })

  return { changeFloralMockupStatus, isChangingFloralMockupStatus }
}
