import { useUploadFileWithToast } from '@/hooks/use-upload-file-with-toast'
import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { resolveStagedImages } from '@/lib/staged-uploads'
import { useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { toast } from 'sonner'
import {
  B2B_SERVICES_GROUP,
  B2B_SERVICES_KEY_PREFIX,
  b2bServicesKeySuffix,
  parseB2BServiceDetail,
  type B2BServiceDetail
} from '../../../b2b-service-detail-palette'
import configService from '../../../services'
import { ConfigKind, InputType, type Config } from '../../../types'
import type { CreateConfigFormValues } from '../../../validations'

// Persists a single `b2bServices.<slug>` doc: update when a config exists, create otherwise.
export function useSaveB2BService() {
  const { t } = useTenantTranslation()
  const queryClient = useQueryClient()
  const { uploadFileWithToast } = useUploadFileWithToast()
  const [isSaving, setIsSaving] = useState(false)

  const save = async (
    working: B2BServiceDetail,
    existingConfig: Config | null,
    configLabel: string
  ): Promise<boolean> => {
    setIsSaving(true)
    try {
      const resolved = parseB2BServiceDetail(working)

      // Must resolve staged uploads before JSON.stringify, or blob: URLs get buried in the string.
      const uploaded = await resolveStagedImages(resolved, (file) =>
        uploadFileWithToast({ file, showSuccessToast: false })
      )
      // The upload failure was already reported; don't submit blob: URLs.
      if (!uploaded.ok) return false
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

      if (existingConfig) {
        await configService.updateConfig({ id: existingConfig.id, body })
        toast.success(t('configKeys.toast.updated'))
      } else {
        await configService.createConfig({ body })
        toast.success(t('configKeys.toast.created'))
      }

      queryClient.invalidateQueries({ queryKey: ['configs'] })
      return true
    } catch {
      toast.error(t('configKeys.toast.error'))
      return false
    } finally {
      setIsSaving(false)
    }
  }

  return { save, isSaving }
}
