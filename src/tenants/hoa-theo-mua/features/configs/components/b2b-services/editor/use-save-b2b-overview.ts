import { useUploadFileWithToast } from '@/hooks/use-upload-file-with-toast'
import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { resolveStagedImages, StagedUploadError } from '@/lib/staged-uploads'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { B2B_OVERVIEW_KEY, parseB2BOverview } from '../../../b2b-overview-palette'
import { B2B_SERVICES_GROUP } from '../../../b2b-service-detail-palette'
import { configKeys } from '../../../query-keys'
import configService from '../../../services'
import { ConfigKind, InputType, type B2BOverview, type Config } from '../../../types'
import type { CreateConfigFormValues } from '../../../validations'

interface SaveB2BOverviewVariables {
  working: B2BOverview
  existingConfig: Config | null
}

export const useSaveB2BOverview = () => {
  const { t } = useTenantTranslation()
  const queryClient = useQueryClient()
  const { uploadFileWithToast } = useUploadFileWithToast()

  const { mutate: save, isPending: isSaving } = useMutation({
    mutationFn: async ({ working, existingConfig }: SaveB2BOverviewVariables) => {
      const resolved = parseB2BOverview(working)

      // Must resolve staged uploads before JSON.stringify, or blob: URLs get buried in the string.
      const uploaded = await resolveStagedImages(resolved, (file) =>
        uploadFileWithToast({ file, showSuccessToast: false })
      )

      // The upload failure was already reported; don't submit blob: URLs.
      if (!uploaded.ok) throw new StagedUploadError()

      const body: CreateConfigFormValues = {
        key: B2B_OVERVIEW_KEY,
        isPublic: true,
        group: B2B_SERVICES_GROUP,
        kind: ConfigKind.content,
        value: {
          group: B2B_SERVICES_GROUP,
          label: t('configsPage.b2bOverviewDialog.configLabel'),
          inputType: InputType.json,
          required: false,
          options: [],
          validations: [],
          value: JSON.stringify(uploaded.value)
        }
      }

      if (existingConfig) return configService.updateConfig({ id: existingConfig.id, body })
      return configService.createConfig({ body })
    },
    onSuccess: (_, { existingConfig }) => {
      toast.success(existingConfig ? t('configKeys.toast.updated') : t('configKeys.toast.created'))
    },
    onError: (error) => {
      if (error instanceof StagedUploadError) return
      toast.error(t('configKeys.toast.error'))
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: configKeys.all })
    }
  })

  return { save, isSaving }
}
