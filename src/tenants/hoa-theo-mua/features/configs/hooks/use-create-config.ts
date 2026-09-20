import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { configKeys } from '../query-keys'
import configService from '../services'
import {
  configExportSchema,
  defaultConfigFormValues,
  type CreateConfigFormInput,
  type CreateConfigFormValues
} from '../validations'

export const useCreateConfig = () => {
  const queryClient = useQueryClient()
  const { t } = useTenantTranslation()

  const methods = useForm<CreateConfigFormInput, unknown, CreateConfigFormValues>({
    defaultValues: defaultConfigFormValues,
    resolver: zodResolver(configExportSchema)
  })

  const { mutate: createConfig, isPending: isCreatingConfig } = useMutation({
    mutationFn: ({ body }: { body: CreateConfigFormValues }) => configService.createConfig({ body }),
    onSuccess: () => {
      toast.success(t('configKeys.toast.created'))
      methods.reset(defaultConfigFormValues)
    },
    onError: () => {
      toast.error(t('configKeys.toast.error'))
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: configKeys.all })
    }
  })

  return { methods, createConfig, isCreatingConfig }
}
