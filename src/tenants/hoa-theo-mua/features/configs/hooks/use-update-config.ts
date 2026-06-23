import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import configService from '../services'
import {
  configExportSchema,
  defaultConfigFormValues,
  type CreateConfigFormInput,
  type CreateConfigFormValues
} from '../validations'

export const useUpdateConfig = (configId?: string) => {
  const queryClient = useQueryClient()
  const { t } = useTenantTranslation()

  const methods = useForm<CreateConfigFormInput, unknown, CreateConfigFormValues>({
    defaultValues: defaultConfigFormValues,
    resolver: zodResolver(configExportSchema)
  })

  const { mutate: updateConfig, isPending: isUpdatingConfig } = useMutation({
    // configId is always set when this mutate is called — callers gate on config !== null
    mutationFn: ({ body }: { body: CreateConfigFormValues }) => configService.updateConfig({ id: configId!, body }),
    onSuccess: () => {
      toast.success(t('configKeys.toast.updated'))
    },
    onError: () => {
      toast.error(t('configKeys.toast.error'))
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['configs'] })
    }
  })

  return { methods, updateConfig, isUpdatingConfig }
}
