import { Button } from '@/components/ui/button'
import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { useConfirmStore } from '@/lib/zustand/confirm.store'
import { ListChecks, Undo2 } from 'lucide-react'
import { useDirtyActions, useDirtySnapshot } from '../../state/dirty-registry-hooks'

/**
 * Thanh tóm tắt dính ở cuối màn, chỉ hiện trên viewport hẹp - nơi một row dirty dễ bị cuộn khuất.
 *
 * Cố ý KHÔNG có thao tác lưu nào. Mỗi config row sở hữu record riêng và `PUT /v1/configs/:id`
 * riêng; BE không có endpoint hàng loạt lẫn transaction, nên "lưu tất cả" sẽ là N lệnh ghi độc
 * lập với ngữ nghĩa lỗi một phần mà BE không định nghĩa. Thanh này chỉ điều hướng và huỷ bỏ.
 */
export default function UnsavedChangesBar() {
  const { t } = useTenantTranslation()
  const { dirtyCount, hasUnsavedWork } = useDirtySnapshot()
  const { discard, reviewNext } = useDirtyActions()
  const { confirm } = useConfirmStore()

  // Không hiện cho row chỉ đang lưu - phần việc đó đã trên đường tới server.
  if (!hasUnsavedWork) return null

  const handleDiscard = async () => {
    const ok = await confirm({
      title: t('configsPage.unsaved.discardTitle'),
      description: t('configsPage.unsaved.discardDescription', { count: dirtyCount }),
      confirmText: t('configsPage.unsaved.discard'),
      cancelText: t('common.button.cancel'),
      variant: 'destructive'
    })
    if (ok) discard()
  }

  return (
    <div
      role='region'
      aria-label={t('configsPage.unsaved.regionLabel')}
      className='sticky bottom-0 z-20 -mx-4 mt-2 flex items-center gap-2 border-t bg-background/95 px-4 py-2.5 backdrop-blur lg:hidden'
    >
      <p aria-live='polite' className='min-w-0 flex-1 truncate text-sm font-medium'>
        {t('configsPage.unsaved.count', { count: dirtyCount })}
      </p>

      <Button type='button' variant='outline' size='sm' className='shrink-0' onClick={() => reviewNext()}>
        <ListChecks data-icon='inline-start' />
        {t('configsPage.unsaved.review')}
      </Button>

      <Button type='button' variant='destructive' size='sm' className='shrink-0' onClick={handleDiscard}>
        <Undo2 data-icon='inline-start' />
        {t('configsPage.unsaved.discard')}
      </Button>
    </div>
  )
}
