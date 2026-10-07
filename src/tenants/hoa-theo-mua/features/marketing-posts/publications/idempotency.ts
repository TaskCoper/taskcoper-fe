import type { MarketingPostPlatform } from '../types'

// Idempotency key là thứ chặn một lần bấm đăng biến thành hai bài trên Meta khi mạng chập chờn.
// Quy tắc của backend: cùng key + cùng body -> trả lại job cũ; cùng key + khác body -> 409.
// Vậy nên key phải BỀN theo "lần xác nhận" chứ không sinh mới mỗi lần gọi hàm: React Query còn
// retry một lần sau 3 giây, mà mỗi lần retry lại một key mới thì đúng vào trường hợp nguy hiểm
// nhất - request đầu đã tới backend nhưng response mất.

export interface IdempotencyScope {
  postId: string
  platform: MarketingPostPlatform
  accountId: string
  // Hash preview: nội dung/ảnh/account đổi thì đây là một lần xác nhận khác
  revision: string
  // Giờ lịch đã chuẩn hoá, bỏ trống khi đăng ngay
  scheduledAt?: string | null
}

const toScopeKey = ({ postId, platform, accountId, revision, scheduledAt }: IdempotencyScope) =>
  [postId, platform, accountId, revision, scheduledAt ?? 'now'].join('|')

const keys = new Map<string, string>()

const createKey = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') return crypto.randomUUID()

  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`
}

// Cùng một lần xác nhận luôn nhận lại đúng key cũ, kể cả khi gọi lại sau lỗi mạng
export const getIdempotencyKey = (scope: IdempotencyScope) => {
  const scopeKey = toScopeKey(scope)
  const existing = keys.get(scopeKey)
  if (existing) return existing

  const key = createKey()
  keys.set(scopeKey, key)

  return key
}

// Gọi khi job đã được tạo xong. Giữ lại key sau khi thành công chỉ tổ làm 409 nếu admin lỡ bấm
// đăng lại trên một preview mới trùng scope.
export const clearIdempotencyKey = (scope: IdempotencyScope) => {
  keys.delete(toScopeKey(scope))
}
