import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { configKeys } from '../query-keys'
import configService from '../services'

export const useDeleteConfig = () => {
  const queryClient = useQueryClient()
  const { t } = useTenantTranslation()

  const { mutate: deleteConfig, isPending: isDeletingConfig } = useMutation({
    mutationFn: configService.deleteConfig,
    onSuccess: () => {
      toast.success(t('configKeys.toast.deleted'))
    },
    onError: () => {
      toast.error(t('configKeys.toast.error'))
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: configKeys.all })
    }
  })

  return { deleteConfig, isDeletingConfig }
}
