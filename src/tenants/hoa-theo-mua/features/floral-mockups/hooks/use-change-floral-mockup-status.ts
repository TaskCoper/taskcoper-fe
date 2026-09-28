import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { floralMockupKeys } from '../query-keys'
import floralMockupService from '../services'

export const useChangeFloralMockupStatus = () => {
  const { t } = useTenantTranslation()
  const queryClient = useQueryClient()
  const { mutate: changeFloralMockupStatus, isPending: isChangingFloralMockupStatus } = useMutation({
    mutationFn: async (payload: { id: string; isActive: boolean }) => {
      await floralMockupService.changeStatusFloralMockup(payload.id)
      return payload
    },
    onSuccess: ({ isActive }) => {
      toast.success(t(`floralMockups.statusAction.${isActive ? 'activateSuccess' : 'deactivateSuccess'}`))
    },
    onError: (error) => {
      toast.error(t('error.somethingWentWrong'), {
        description: error.response?.data?.detail
      })
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: floralMockupKeys.lists() })
    }
  })

  return { changeFloralMockupStatus, isChangingFloralMockupStatus }
}
