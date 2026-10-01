import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { TriangleAlertIcon } from 'lucide-react'
import {
  getPublicationErrorKey,
  isImageErrorCode,
  isRateLimitedCode,
  needsAccountReauth,
  parsePublicationErrorCode
} from '../error-codes'

// Lý do một lần đăng hỏng, dịch từ mã lỗi backend. `title` để nói rõ đây là lỗi của lần trước
// khi khối đăng đã mở lại cho đăng lần mới.
const MarketingPublicationErrorNotice = ({ errorCode, title }: { errorCode: string; title?: string }) => {
  const { t } = useTenantTranslation()
  const { baseCode, imageOrder } = parsePublicationErrorCode(errorCode)
  const key = getPublicationErrorKey(baseCode)

  return (
    <div className='space-y-1.5 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300'>
      {title && <p className='font-medium'>{title}</p>}
      <p className='flex items-start gap-1.5'>
        <TriangleAlertIcon className='mt-0.5 size-3.5 shrink-0' />
        <span>
          {/* Lỗi thuộc về một ảnh thì nói ảnh nào trước, giống dòng cảnh báo ảnh ở khối đăng */}
          {imageOrder !== null && (
            <b className='font-medium'>{t('marketingPosts.publication.media.imagePrefix', { order: imageOrder })} </b>
          )}
          {key
            ? t(`marketingPosts.publication.error.${key}`)
            : t('marketingPosts.publication.reason.unknown', { code: errorCode })}
        </span>
      </p>

      {/* Giữ mã trần để admin đối chiếu với log backend khi cần báo lỗi */}
      <p className='font-mono text-[0.7rem] opacity-70'>{errorCode}</p>

      {/* Retry dùng lại ĐÚNG snapshot cũ, nên lỗi do ảnh thì retry chỉ hỏng lại y hệt */}
      {isImageErrorCode(errorCode) && <p>{t('marketingPosts.publication.hint.fixImage')}</p>}
      {needsAccountReauth(errorCode) && <p>{t('marketingPosts.publication.hint.reconnectAccount')}</p>}
      {isRateLimitedCode(errorCode) && <p>{t('marketingPosts.publication.hint.rateLimited')}</p>}
    </div>
  )
}

export default MarketingPublicationErrorNotice
