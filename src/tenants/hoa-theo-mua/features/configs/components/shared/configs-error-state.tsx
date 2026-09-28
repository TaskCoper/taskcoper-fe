import { Button } from '@/components/ui/button'
import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { cn } from '@/shared/utils'
import { AlertTriangle, RefreshCw } from 'lucide-react'

/**
 * Hiện khi tải danh sách config thất bại.
 *
 * Các query này tắt `throwOnError` toàn cục - nếu bật, cả app sẽ bị thay bằng màn hình lỗi của
 * router. Giữ lỗi lại ở đây chỉ an toàn vì nó *hiện ra*: nếu lùi về mảng rỗng, màn hình sẽ báo
 * "chưa có config" và dụ người ta tạo lại những record vốn đã tồn tại.
 */
export default function ConfigsErrorState({
  onRetry,
  isRetrying,
  className
}: {
  onRetry: () => void
  isRetrying?: boolean
  className?: string
}) {
  const { t } = useTenantTranslation()

  return (
    <div
      role='alert'
      className={cn(
        'flex flex-col items-center gap-3 rounded-xl border border-dashed px-6 py-12 text-center',
        className
      )}
    >
      <AlertTriangle className='size-6 text-muted-foreground' aria-hidden='true' />
      <div className='space-y-1'>
        <p className='text-sm font-medium'>{t('configsPage.error.title')}</p>
        <p className='text-sm text-muted-foreground'>{t('configsPage.error.description')}</p>
      </div>
      <Button type='button' variant='outline' size='sm' onClick={onRetry} disabled={isRetrying}>
        <RefreshCw data-icon='inline-start' />
        {t('configsPage.error.retry')}
      </Button>
    </div>
  )
}
