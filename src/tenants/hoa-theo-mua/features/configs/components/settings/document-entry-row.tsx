import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { Code2Icon, PencilIcon } from 'lucide-react'
import type { Config } from '../../types'

interface Props {
  config: Config
  /** Số mục document đang chứa nếu đếm được; `null` khi shape không phải collection. */
  itemCount?: number | null
  onEdit: () => void
  /** `true` khi shape của record không khớp editor của họ config - xem `resolveEditor`. */
  isGenericFallback?: boolean
}

/**
 * Một config có cấu trúc (JSON), trình bày dạng card kèm nút Sửa rõ ràng.
 *
 * Cố ý khác `SettingRow`: đây là document sửa trong dialog riêng, không phải giá trị sửa tại chỗ.
 */
export default function DocumentEntryRow({ config, itemCount, onEdit, isGenericFallback }: Props) {
  const { t } = useTenantTranslation()

  return (
    <Card className='flex-row items-center gap-3 rounded-xl p-3 shadow-none'>
      <span className='flex size-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground'>
        <Code2Icon className='size-4' />
      </span>

      <div className='min-w-0 flex-1'>
        <p className='truncate text-sm font-medium'>{config.value?.label || config.key}</p>
        <p className='truncate font-mono text-xs text-muted-foreground' title={config.key}>
          {config.key}
        </p>
        {typeof itemCount === 'number' && (
          <p className='mt-0.5 truncate text-xs text-muted-foreground'>
            {t('configsPage.card.itemCount', { count: itemCount })}
          </p>
        )}
      </div>

      <Button
        type='button'
        variant='outline'
        size='sm'
        className='shrink-0'
        // Đánh dấu nút này để focus quay lại đúng đây khi đóng editor.
        data-editor-opener={config.key}
        onClick={onEdit}
        title={isGenericFallback ? t('configsPage.card.genericFallbackHint') : undefined}
      >
        <PencilIcon data-icon='inline-start' />
        {t('configsPage.card.edit')}
      </Button>
    </Card>
  )
}
