import { useTenantConfig } from '@/lib/feature-flags/use-feature-flags'
import type { TOptions } from 'i18next'
import { useTranslation } from 'react-i18next'

export type TenantT = (key: string, options?: TOptions) => string

// Trả về `t` theo namespace của tenant hiện tại, có fallback về namespace base `translation`.
// Key của tenant sẽ override key base; nếu tenant thiếu key thì dùng bản dịch từ base.
// Tenant namespace được load động và không nằm trong CustomTypeOptions,
// nên ở đây `t` nhận key dạng string thường (không autocomplete)
export function useTenantTranslation() {
  const { i18nNamespace } = useTenantConfig()
  const ns = (i18nNamespace ? [i18nNamespace, 'translation'] : 'translation') as 'translation'
  const result = useTranslation(ns)
  return result as Omit<typeof result, 't'> & { t: TenantT }
}
