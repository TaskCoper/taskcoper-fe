import { useUploadFileWithToast } from '@/hooks/use-upload-file-with-toast'
import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { resolveStagedImages } from '@/lib/staged-uploads'
import { useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { toast } from 'sonner'
import { B2B_OVERVIEW_KEY, parseB2BOverview, type B2BOverview } from '../../../b2b-overview-palette'
import { B2B_SERVICES_GROUP } from '../../../b2b-service-detail-palette'
import configService from '../../../services'
import { ConfigKind, InputType, type Config } from '../../../types'
import type { CreateConfigFormValues } from '../../../validations'

// Persists the overview doc: update when a config exists, create otherwise.
export function useSaveB2BOverview() {
  const { t } = useTenantTranslation()
  const queryClient = useQueryClient()
  const { uploadFileWithToast } = useUploadFileWithToast()
  const [isSaving, setIsSaving] = useState(false)

  const save = async (working: B2BOverview, existingConfig: Config | null): Promise<boolean> => {
    setIsSaving(true)
    try {
      const resolved = parseB2BOverview(working)

      // Must resolve staged uploads before JSON.stringify, or blob: URLs get buried in the string.
      const uploaded = await resolveStagedImages(resolved, (file) =>
        uploadFileWithToast({ file, showSuccessToast: false })
      )
      // The upload failure was already reported; don't submit blob: URLs.
      if (!uploaded.ok) return false
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
