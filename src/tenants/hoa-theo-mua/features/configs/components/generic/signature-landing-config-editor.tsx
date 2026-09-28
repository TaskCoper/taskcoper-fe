import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { PRODUCT_COLLECTION_GROUP } from '../../product-collection-palette'
import { configKeys } from '../../query-keys'
import configService from '../../services'
import {
  groupSignatureLandings,
  parseSignatureLandingMap,
  PRODUCT_SIGNATURE_KEY,
  stringifySignatureLandings
} from '../../signature-landing-palette'
import { ConfigKind, InputType, type Config } from '../../types'
import type { CreateConfigFormValues } from '../../validations'
import InlineEditorShell from '../settings/inline-editor-shell'
import SignatureLandingEditor from './signature-landing-editor'

interface Props {
  /** `null` là tạo mới singleton `products.signature`; ngược lại sửa tại chỗ. */
  existingConfig: Config | null
  onSaved?: (savedKey: string) => void
}

/**
 * `products.signature` khi đứng riêng trong category của nó.
 *
 * `SignatureLandingEditor` chỉ là một field có value/onChange, trước đây sống nhờ form của
 * generic dialog. Ở đây nó cần một vỏ tự lưu được, nên phần lưu nằm trọn trong component này.
 */
export default function SignatureLandingConfigEditor({ existingConfig, onSaved }: Props) {
  const { t } = useTenantTranslation()
  const queryClient = useQueryClient()

  const [raw, setRaw] = useState(() => toRawValue(existingConfig))
  const [baseline, setBaseline] = useState(() => normalize(toRawValue(existingConfig)))
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    const next = toRawValue(existingConfig)
    setRaw(next)
    setBaseline(normalize(next))
  }, [existingConfig])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const body: CreateConfigFormValues = {
        key: PRODUCT_SIGNATURE_KEY,
        isPublic: true,
        group: PRODUCT_COLLECTION_GROUP,
        kind: ConfigKind.content,
        value: {
          group: PRODUCT_COLLECTION_GROUP,
          // Giữ nguyên label cũ khi sửa: label là chữ do người dùng đặt, không phải chuỗi dịch.
          label: existingConfig?.value.label || t('configsPage.signatureLanding.configLabel'),
          inputType: InputType.json,
          required: false,
          options: [],
          validations: [],
          // Lưu bản đã chuẩn hóa để giá trị trên server trùng với thứ editor đang hiển thị.
          value: normalize(raw)
        }
      }

      if (existingConfig) {
        await configService.updateConfig({ id: existingConfig.id, body })
        toast.success(t('configKeys.toast.updated'))
      } else {
        await configService.createConfig({ body })
        toast.success(t('configKeys.toast.created'))
      }

      queryClient.invalidateQueries({ queryKey: configKeys.all })
      setBaseline(normalize(raw))
      onSaved?.(PRODUCT_SIGNATURE_KEY)
    } catch {
      toast.error(t('configKeys.toast.error'))
    } finally {
      setIsSaving(false)
    }
  }

  const revert = () => {
    const next = toRawValue(existingConfig)
    setRaw(next)
    setBaseline(normalize(next))
  }

  return (
    <InlineEditorShell
      editorId={PRODUCT_SIGNATURE_KEY}
      title={t('configsPage.signatureLanding.title')}
      description={t('configsPage.signatureLanding.description')}
      isDirty={normalize(raw) !== baseline}
      isSaving={isSaving}
      onRevert={revert}
      onSave={() => void handleSave()}
    >
      <SignatureLandingEditor value={raw} onChange={setRaw} title={t('configsPage.signatureLanding.groupsTitle')} />
    </InlineEditorShell>
  )
}

const EMPTY_MAP = '{}'

const toRawValue = (config: Config | null): string => {
  const value = config?.value?.value
  if (value == null) return EMPTY_MAP
  return typeof value === 'string' ? value : JSON.stringify(value)
}

/**
 * Đưa map về đúng dạng editor sẽ phát ra, để so sánh dirty không báo động vì khác khoảng trắng
 * hay khác thứ tự khóa so với bản đang nằm trên server.
 */
const normalize = (value: unknown): string =>
  stringifySignatureLandings(groupSignatureLandings(parseSignatureLandingMap(value)))
