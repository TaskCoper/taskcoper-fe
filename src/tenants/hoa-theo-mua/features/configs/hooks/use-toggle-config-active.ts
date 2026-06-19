import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import configSystemService from '../services'

export const useToggleConfigActive = () => {
  const { t } = useTenantTranslation()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: configSystemService.updateConfigActive,
    onError: (error) => {
      toast(t('error.somethingWentWrong'), {
        description: error.response?.data?.detail
      })
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['htm-system-configs', 'list'] })
    }
  })
}
