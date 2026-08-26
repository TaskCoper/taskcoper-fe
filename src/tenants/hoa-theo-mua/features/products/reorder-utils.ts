import { INITIAL_POSITION, POSITION_GAP } from '@/shared/constants'
import { arrayMove } from '@dnd-kit/sortable'
import type { PinnedProduct } from './types'

export interface PinnedPositionUpdate {
  id: string
  position: number
}

export interface PinnedScopeVariables {
  /** Những product đang có mutation pending. */
  pendingIds: string[]
}

/**
 * Kết quả của việc tính toán reorder.
 *
 * - `items`: danh sách mới dùng để optimistic update cache.
 * - `updates`: những product thực sự cần gọi API để cập nhật position.
 * - `isRenumber`: có phải đánh lại position cho cả danh sách hay không.
 */
export interface PinnedReorderPlan {
  items: PinnedProduct[]
  updates: PinnedPositionUpdate[]
  isRenumber: boolean
}

/**
 * Khoảng cách nhỏ nhất giữa 2 position để vẫn tạo được
 * một integer position nằm ở giữa.
 */
const MIN_GAP = 2

/**
 * Kiểm tra danh sách có position hợp lệ và tăng dần hay không.
 */
export function isNormalized(items: PinnedProduct[]): boolean {
  // Position trước đó để so sánh với item hiện tại.
  let previous = Number.NEGATIVE_INFINITY

  for (const item of items) {
    const position = item.position

    // Position phải tồn tại, là finite number và lớn hơn item trước.
    if (position == null || !Number.isFinite(position) || position <= previous) {
      return false
    }

    previous = position
  }

  return true
}

/**
 * Đánh lại position cho toàn bộ danh sách theo khoảng cách cố định.
 *
 * Dùng khi dữ liệu hiện tại có position lỗi, duplicate,
 * hoặc không còn đủ khoảng trống để insert/reorder.
 */
export function renumber(items: PinnedProduct[]): PinnedReorderPlan {
  // Gán lại position đều nhau: GAP, GAP * 2, GAP * 3, ...
  const next = items.map((item, index) => ({
    ...item,
    position: (index + 1) * POSITION_GAP
  }))

  // Chỉ gửi API cho những product có position thực sự thay đổi.
  const updates = next
    .filter((item, index) => item.position !== items[index].position)
    .map((item) => ({
      id: item.productId,
      position: item.position
    }))

  return {
    items: next,
    updates,
    isRenumber: true
  }
}

/**
 * Tính position mới cho item tại `index`.
 *
 * Trả về `null` nếu không còn khoảng trống giữa 2 item,
 * lúc đó caller cần fallback sang `renumber`.
 */
function positionBetween(items: PinnedProduct[], index: number): number | null {
  // Position của item ngay trước.
  const previous = items[index - 1]?.position ?? null

  // Position của item ngay sau.
  const next = items[index + 1]?.position ?? null

  // Danh sách chỉ có một item.
  if (previous == null && next == null) {
    return INITIAL_POSITION
  }

  // Item nằm đầu danh sách: tạo position thấp hơn item kế tiếp.
  if (previous == null) {
    return next! - POSITION_GAP
  }

  // Item nằm cuối danh sách: tạo position cao hơn item trước.
  if (next == null) {
    return previous + POSITION_GAP
  }

  // Không còn integer nào nằm giữa 2 position.
  if (next - previous < MIN_GAP) {
    return null
  }

  // Lấy midpoint để chỉ cần update position của item vừa di chuyển.
  return Math.floor((previous + next) / 2)
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

  // Sắp xếp lại list theo vị trí drag/drop mới.
  const reordered = arrayMove(items, fromIndex, toIndex)

  // Product vừa được di chuyển.
  const moved = reordered[toIndex]

  // Bỏ product vừa move ra để kiểm tra position của các item còn lại.
  // Position cũ của moved không còn quan trọng vì sắp được tính lại.
  const resting = reordered.filter((item) => item.productId !== moved.productId)

  // Nếu các item còn lại đã có position lỗi thì đánh lại toàn bộ.
  if (!isNormalized(resting)) {
    return renumber(reordered)
  }

  // Tính position mới giữa 2 hàng xóm.
  const position = positionBetween(reordered, toIndex)

  // Không còn khoảng trống thì phải renumber.
  if (position === null) {
    return renumber(reordered)
  }

  return {
    // Optimistic list với position mới của product vừa move.
    items: reordered.map((item) => (item.productId === moved.productId ? { ...item, position } : item)),
    updates: [
      {
        id: moved.productId,
        position
      }
    ],
    isRenumber: false
  }
}

/**
 * Chèn một product vào vị trí `toIndex`.
 *
 * Dùng cho restore sau unpin hoặc pin vào một vị trí cụ thể.
 */
export function planInsert(items: PinnedProduct[], item: PinnedProduct, toIndex: number): PinnedReorderPlan {
  // Giữ index luôn nằm trong khoảng hợp lệ [0, items.length].
  const index = Math.max(0, Math.min(toIndex, items.length))

  // Chèn item vào danh sách.
  const inserted = [...items.slice(0, index), item, ...items.slice(index)]

  // Kiểm tra danh sách cũ vì item mới có thể chưa có position.
  // Nếu dữ liệu cũ đã lỗi thì renumber toàn bộ luôn.
  if (!isNormalized(items)) {
    return renumber(inserted)
  }

  // Tính position cho item vừa insert.
  const position = positionBetween(inserted, index)

  // Không còn khoảng trống thì renumber toàn bộ.
  if (position === null) {
    return renumber(inserted)
  }

  return {
    // Gắn position vừa tính vào item mới.
    items: inserted.map((entry) => (entry.productId === item.productId ? { ...entry, position } : entry)),
    // Chỉ item mới cần persist position.
    updates: [
      {
        id: item.productId,
        position
      }
    ],

    isRenumber: false
  }
}

/**
 * Tạo `count` position mới nằm sau tất cả pinned product hiện tại.
 */
export function resolveAppendPositions(items: PinnedProduct[], count: number): number[] {
  // Chỉ lấy những position hợp lệ.
  const positions = items
    .map((item) => item.position)
    .filter((position): position is number => position != null && Number.isFinite(position))

  // Nếu đã có item, bắt đầu từ position lớn nhất.
  // Nếu chưa có item, chọn base sao cho position đầu tiên = INITIAL_POSITION.
  const base = positions.length > 0 ? Math.max(...positions) : INITIAL_POSITION - POSITION_GAP

  // Tạo các position tăng dần, cách nhau POSITION_GAP.
  return Array.from({ length: count }, (_, index) => base + (index + 1) * POSITION_GAP)
}

/**
 * Tính position append cho một product vừa được pin.
 *
 * Bỏ chính product đó ra khỏi danh sách vì server có thể
 * đã trả về row mới trước khi client tính position.
 *
 * Nếu đây là pinned product duy nhất thì không cần update position.
 */
export function resolveAppendPositionFor(pinned: PinnedProduct[], productId: string): number | null {
  // Chỉ xét các pinned product đã tồn tại trước đó.
  const others = pinned.filter((item) => item.productId !== productId)

  // Product đầu tiên dùng position mặc định của server.
  if (others.length === 0) {
    return null
  }

  // Lấy một position mới nằm cuối danh sách.
  return resolveAppendPositions(others, 1)[0]
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
