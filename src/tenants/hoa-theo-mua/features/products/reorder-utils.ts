import { arrayMove } from '@dnd-kit/sortable'
import type { PinnedAnchor, PinnedProduct } from './types'

export interface PinnedScopeVariables {
  /** Những product đang có mutation pending. */
  pendingIds: string[]
}

/**
 * Kết quả của việc sắp xếp lại.
 *
 * - `items`: danh sách mới dùng để optimistic update cache.
 * - `productId` + `anchor`: sản phẩm vừa di chuyển và mốc gửi cho BE. BE tự tính position.
 */
export interface PinnedReorderPlan {
  items: PinnedProduct[]
  productId: string
  anchor: PinnedAnchor
}

/**
 * Mốc cho item tại `index`: đặt ngay sau item đứng trước, nếu đứng đầu danh sách thì đặt ngay trước item kế tiếp.
 * Trả về `{}` khi không có hàng xóm nào (danh sách chỉ có một item).
 */
function anchorAt(items: PinnedProduct[], index: number): PinnedAnchor {
  const previous = items[index - 1]
  if (previous) {
    return { afterProductId: previous.productId }
  }

  const next = items[index + 1]
  if (next) {
    return { beforeProductId: next.productId }
  }

  return {}
}

/**
 * Khi drag một pinned product sang vị trí khác.
 */
export function planMove(items: PinnedProduct[], fromIndex: number, toIndex: number): PinnedReorderPlan | null {
  // Không có thay đổi hoặc index âm.
  if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0) {
    return null
  }

  // Index nằm ngoài danh sách.
  if (fromIndex >= items.length || toIndex >= items.length) {
    return null
  }

  const reordered = arrayMove(items, fromIndex, toIndex)

  return {
    items: reordered,
    productId: reordered[toIndex].productId,
    anchor: anchorAt(reordered, toIndex)
  }
}

/**
 * Chèn một product vào vị trí `toIndex`.
 *
 * Dùng cho restore sau unpin: mốc được gửi kèm request pin.
 */
export function planInsert(items: PinnedProduct[], item: PinnedProduct, toIndex: number): PinnedReorderPlan {
  // Giữ index luôn nằm trong khoảng hợp lệ [0, items.length].
  const index = Math.max(0, Math.min(toIndex, items.length))
  const inserted = [...items.slice(0, index), item, ...items.slice(index)]

  return {
    items: inserted,
    productId: item.productId,
    anchor: anchorAt(inserted, index)
  }
}

/**
 * Tìm vị trí nên restore một product đã bị unpin.
 *
 * Thay vì dùng lại index/position cũ một cách cứng nhắc,
 * tìm predecessor gần nhất trong snapshot vẫn còn tồn tại
 * trong danh sách hiện tại rồi restore ngay sau nó.
 */
export function resolveRestoreIndex(current: PinnedProduct[], snapshot: PinnedProduct[], productId: string): number {
  // Vị trí cũ của product trong snapshot.
  const snapshotIndex = snapshot.findIndex((item) => item.productId === productId)

  // Không tìm thấy trong snapshot thì append cuối danh sách.
  if (snapshotIndex === -1) {
    return current.length
  }

  // Đi ngược từ vị trí cũ để tìm product đứng trước gần nhất
  // mà hiện tại vẫn còn trong pinned list.
  for (let index = snapshotIndex - 1; index >= 0; index--) {
    const predecessor = snapshot[index]

    if (predecessor.productId === productId) {
      continue
    }

    const currentIndex = current.findIndex((item) => item.productId === predecessor.productId)

    // Restore ngay sau predecessor đó.
    if (currentIndex !== -1) {
      return currentIndex + 1
    }
  }

  // Không còn predecessor nào thì restore lên đầu.
  return 0
}
