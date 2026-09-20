import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { useConfirmStore } from '@/lib/zustand/confirm.store'
import type { CreateConfigFormValues } from '../../validations'

export const getGroupFromKey = (key: string): string => key.split('.')[0] ?? ''

/** Group luôn suy ra từ key và ghi ở cả hai tầng của payload để BE không nhận hai giá trị lệch nhau. */
export const composeConfigBody = (body: CreateConfigFormValues, resolvedValue: unknown): CreateConfigFormValues => {
  const group = getGroupFromKey(body.key) || body.value.group
  return {
    ...body,
    group,
    value: { ...body.value, group, value: resolvedValue as CreateConfigFormValues['value']['value'] }
  }
}

/**
 * Escape, click ra ngoài overlay và nút Huỷ đều vứt bỏ nội dung đang nhập. Dialog không nằm trong
 * dirty registry của trang (nó không phải một row), nên phải tự chặn ở đây.
 *
 * `isFormDirty` phải được đọc trong lúc render: `formState` là Proxy, chỉ bắt đầu theo dõi một
 * field sau khi field đó được truy cập lúc render. Đọc `isDirty` chỉ bên trong handler thì nó
 * vĩnh viễn `false` và guard này thành vô hiệu.
 */
export function useUnsavedCloseGuard(isFormDirty: boolean, close: () => void) {
  const { t } = useTenantTranslation()
  const { confirm } = useConfirmStore()

  return async () => {
    if (!isFormDirty) {
      close()
      return
    }
    const confirmed = await confirm({
      title: t('configsPage.unsaved.leaveTitle'),
      description: t('configsPage.unsaved.leaveDescription'),
      confirmText: t('common.button.leave'),
      cancelText: t('common.button.cancel')
    })
    if (confirmed) close()
  }
}
