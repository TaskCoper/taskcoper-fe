import { useUploadFileWithToast } from '@/hooks/use-upload-file-with-toast'
import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { resolveStagedImages, StagedUploadError } from '@/lib/staged-uploads'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  B2B_SERVICES_GROUP,
  B2B_SERVICES_KEY_PREFIX,
  b2bServicesKeySuffix,
  parseB2BServiceDetail
} from '../../../b2b-service-detail-palette'
import { configKeys } from '../../../query-keys'
import configService from '../../../services'
import { ConfigKind, InputType, type B2BServiceDetail, type Config } from '../../../types'
import type { CreateConfigFormValues } from '../../../validations'

interface SaveB2BServiceVariables {
  working: B2BServiceDetail
  existingConfig: Config | null
  configLabel: string
}

export function useSaveB2BService() {
  const { t } = useTenantTranslation()
  const queryClient = useQueryClient()
  const { uploadFileWithToast } = useUploadFileWithToast()

  const { mutate: save, isPending: isSaving } = useMutation({
    mutationFn: async ({ working, existingConfig, configLabel }: SaveB2BServiceVariables) => {
      const resolved = parseB2BServiceDetail(working)

      // Must resolve staged uploads before JSON.stringify, or blob: URLs get buried in the string.
      const uploaded = await resolveStagedImages(resolved, (file) =>
        uploadFileWithToast({ file, showSuccessToast: false })
      )

      // The upload failure was already reported; don't submit blob: URLs.
      if (!uploaded.ok) throw new StagedUploadError()

      // Rebuild with the canonical prefix casing even when editing a legacy `b2bservices.*` row,
      // so the key stays in sync with the `group` field we always send below.
      const suffix = existingConfig ? b2bServicesKeySuffix(existingConfig.key) : working.slug
      const body: CreateConfigFormValues = {
        key: `${B2B_SERVICES_KEY_PREFIX}${suffix}`,
        isPublic: true,
        group: B2B_SERVICES_GROUP,
        kind: ConfigKind.content,
        value: {
          group: B2B_SERVICES_GROUP,
          label: configLabel.trim() || t('configsPage.b2bServicesDialog.configLabel', { slug: working.slug }),
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
