import { useMemo } from 'react'
import { resolveEditor } from '../../config-registry'
import { safeJsonParse } from '../../palette-shared'
import { InputType, type Config } from '../../types'
import DocumentEntryRow from '../settings/document-entry-row'
import SettingRow from '../settings/setting-row'
import { useConfigRow } from '../settings/use-config-row'

interface ConfigFieldRowProps {
  config: Config
  onEdit: () => void
}

/**
 * Đếm số mục trong một config có cấu trúc, khi shape của nó cho phép đếm chắc chắn.
 *
 * Mọi họ collection đều lưu dạng `{ items: [...] }`, nên đây là con số thật cho banners,
 * feedbacks, product collection, phương thức thanh toán lẫn khổ thiệp - mà module này không cần
 * biết gì về từng họ. Shape khác thì không tóm tắt, chứ không đoán bừa.
 */
const useDocumentSummary = (config: Config): number | null =>
  useMemo(() => {
    const raw = config.value?.value
    const parsed = typeof raw === 'string' ? safeJsonParse(raw) : raw
    const items = Array.isArray(parsed) ? parsed : (parsed as { items?: unknown } | null)?.items
    return Array.isArray(items) ? items.length : null
  }, [config.value?.value])

/** Document sửa trong dialog nên không có form inline và không bao giờ đăng ký dirty. */
function DocumentRow({ config, onEdit }: ConfigFieldRowProps) {
  const itemCount = useDocumentSummary(config)
  const target = resolveEditor(config)

  return (
    <DocumentEntryRow
      config={config}
      itemCount={itemCount}
      onEdit={onEdit}
      // Hiện ra để record trùng prefix key của một họ nhưng sai shape giải thích được vì sao nó
      // mở editor chung thay vì editor riêng của họ đó.
      isGenericFallback={target.type === 'generic'}
    />
  )
}

function PrimitiveRow({ config, onEdit }: ConfigFieldRowProps) {
  const row = useConfigRow(config)
  return <SettingRow config={config} row={row} onEdit={onEdit} />
}

/**
 * Một config record trong panel của category. Chỉ là lớp điều phối mỏng:
 *   `useConfigRow`     - state form, validate, mutation, mở khoá secret, đăng ký dirty
 *   `SettingRow`       - trình bày phẳng cho giá trị sửa tại chỗ
 *   `DocumentEntryRow` - trình bày dạng card cho document JSON
 *
 * Chọn cách trình bày nào là câu hỏi về SHAPE của record, cố ý không phụ thuộc record nằm ở
 * category nào.
 */
export default function ConfigFieldRow({ config, onEdit }: ConfigFieldRowProps) {
  return config.value?.inputType === InputType.json ? (
    <DocumentRow config={config} onEdit={onEdit} />
  ) : (
    <PrimitiveRow config={config} onEdit={onEdit} />
  )
}
