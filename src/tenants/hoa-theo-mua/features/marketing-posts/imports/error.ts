import type { TenantT } from '@/lib/i18n/use-tenant-translation'
import axios from 'axios'
import z from 'zod'
import { getPublicationReasonLabelKey } from '../publications/error-codes'

export const importErrorLabel = (code: string, t: TenantT) => {
  const keys: Record<string, string> = {
    IMPORT_ACCOUNT_REQUIRED: 'accountRequired',
    IMPORT_CONTENT_CHANGED: 'contentChanged',
    IMPORT_SOURCE_DELETED: 'sourceDeleted',
    IMPORT_PROCESSING_FAILED: 'processingFailed'
  }
  if (keys[code]) return t(`marketingPosts.bulkImport.error.${keys[code]}`)
  const existing = getPublicationReasonLabelKey(code)
  return existing ? t(existing) : t('marketingPosts.bulkImport.error.code', { code })
}
export const importRequestError = (error: unknown, t: TenantT) => {
  if (error instanceof z.ZodError) return t('marketingPosts.bulkImport.error.contract')
  if (axios.isAxiosError(error)) {
    const payload: unknown = error.response?.data
    const detail = z.object({ detail: z.string().min(1) }).safeParse(payload)
    if (detail.success) return detail.data.detail
    if (error.code === 'ECONNABORTED' || !error.response) return t('marketingPosts.bulkImport.error.network')
  }
  return t('marketingPosts.bulkImport.error.request')
}
