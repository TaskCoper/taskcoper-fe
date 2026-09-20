import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { Plus } from 'lucide-react'

export interface MissingSingletonItem {
  /** Config key cố định mà singleton này luôn chiếm. */
  key: string
  exists: boolean
  label: string
}

/**
 * Các mục "chưa cấu hình" cho những singleton mà một category sở hữu.
 *
 * Singleton nằm ở key cố định nên về bản chất không nhân bản được, nhưng nút tạo vẫn phải biến
 * mất ngay khi đã có bản ghi - vì vậy `exists` suy ra từ danh sách đã tải chứ không từ cờ cục bộ.
 *
 * Caller chỉ được render khi danh sách đó chắc chắn đủ: fetch lỗi sẽ báo mọi singleton là thiếu
 * và dụ người ta tạo bản thứ hai.
 */
export default function MissingSingletons({
  items,
  onCreate
}: {
  items: MissingSingletonItem[]
  onCreate: (key: string) => void
}) {
  const { t } = useTenantTranslation()
  const missing = items.filter((item) => !item.exists)

  if (missing.length === 0) return null

  return (
    <div className='mt-4 space-y-2'>
      {missing.map((item) => (
        <Card key={item.key} className='flex-row items-center gap-3 rounded-xl border-dashed p-3 shadow-none'>
          <div className='min-w-0 flex-1'>
            <p className='truncate text-sm font-medium'>{item.label}</p>
            <p className='truncate font-mono text-xs text-muted-foreground'>{item.key}</p>
          </div>
          <Button
            type='button'
            variant='outline'
            size='sm'
            className='shrink-0'
            data-editor-opener={`new:${item.key}`}
            onClick={() => onCreate(item.key)}
          >
            <Plus data-icon='inline-start' />
            {t('configsPage.create.action')}
          </Button>
        </Card>
      ))}
    </div>
  )
}
