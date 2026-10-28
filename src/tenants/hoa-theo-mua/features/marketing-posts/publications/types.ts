import type { BasePaginationResponse } from '@/lib/axios'
import { MarketingPostPlatform } from '../types'

// --- Trạng thái job ---------------------------------------------------------------------------

// Trạng thái của TÁC VỤ đăng, không phải của bài. `PlatformPost.status` chỉ là bản gộp tương
// thích enum cũ (Queued/Publishing/NeedsReview đều ra `Publishing`), nên muốn biết đang ở bước
// nào phải đọc job chứ đừng suy từ detail bài.
export const PublicationStatus = {
  Queued: 'Queued',
  Scheduled: 'Scheduled',
  Publishing: 'Publishing',
  Succeeded: 'Succeeded',
  Failed: 'Failed',
  NeedsReview: 'NeedsReview',
  Cancelled: 'Cancelled',
  Closed: 'Closed'
} as const

export type PublicationStatus = (typeof PublicationStatus)[keyof typeof PublicationStatus]

// Mỗi PlatformPost chỉ được có đúng một job đang hoạt động. Bốn trạng thái này khoá sửa/chốt
// nội dung lẫn ảnh của nền tảng đó, và chặn cả ngắt kết nối tài khoản đang dùng.
export const activePublicationStatuses: PublicationStatus[] = [
  PublicationStatus.Queued,
  PublicationStatus.Scheduled,
  PublicationStatus.Publishing,
  PublicationStatus.NeedsReview
]

export const isActivePublication = (status: PublicationStatus) => activePublicationStatuses.includes(status)

// Job đã dừng hẳn nhưng vẫn chặn tạo job mới trên cùng PlatformPost: đăng lại một bài đã đăng
// nằm ngoài phạm vi mốc 12-14.
export const isBlockingPublication = (status: PublicationStatus) =>
  isActivePublication(status) || status === PublicationStatus.Succeeded || status === PublicationStatus.Closed

// --- Preview ----------------------------------------------------------------------------------

// Preview mốc 12 chỉ đọc bản chốt + account local + validator của adapter, KHÔNG gọi provider.
// Nên giá trị luôn là `Unverified`: file/quyền/quota chỉ được kiểm lúc worker chạy.
export const PublicationMediaVerification = {
  Unverified: 'Unverified',
  Verified: 'Verified'
} as const

export type PublicationMediaVerification =
  (typeof PublicationMediaVerification)[keyof typeof PublicationMediaVerification]

export interface PublicationSnapshotImage {
  order: number
  url: string
  // Id của lượt SINH ra ảnh, không phải `generatedPostImageId` của bản chốt trong Studio
  generationId: string
}

// Snapshot dùng enum SỐ của backend cho nền tảng, khác hẳn chuỗi `facebook` mà mọi endpoint
// khác của bài trả về. Đo trên API thật; contract không nói gì về chỗ này.
export const publicationSnapshotPlatforms: Record<number, MarketingPostPlatform> = {
  1: MarketingPostPlatform.Facebook,
  2: MarketingPostPlatform.Instagram,
  3: MarketingPostPlatform.Zalo
}

// Bản chụp cố định của thứ sẽ được đăng. Trigger PostgreSQL chặn sửa, nên retry một job Failed
// dùng lại đúng snapshot này chứ không tự lấy bản chốt mới.
export interface PublicationSnapshot {
  video?: { url: string; fileName: string; posterUrl: string } | null
  basePostId: string
  title: string | null
  content: string
  hashtag: string | null
  // Text đã ghép sẵn theo formatter `postgen-text-v1`: nối title/content/hashtag phần nào không
  // rỗng bằng hai xuống dòng. Hiển thị nguyên văn cái này, đừng tự ghép lại ở FE.
  text: string
  formatterVersion: string
  apiVersion: string | null
  generationId: string | null
  platform: number
  platformPostId: string
  accountId: string
  externalAccountId: string | null
  pageId: string | null
  article?: { author: string; description: string } | null
  images: PublicationSnapshotImage[]
}

export interface PublicationPreview {
  // Hash SHA-256 (64 ký tự) của snapshot + revision account + thời điểm chốt. Gửi lại nguyên
  // chuỗi này khi publish/schedule; KHÁC hoàn toàn `revision` số của job.
  revision: string
  snapshot: PublicationSnapshot
  // `true` chỉ nghĩa là backend nhận job, không cam kết Meta chấp nhận media
  canPublish: boolean
  reasons: string[]
  mediaVerification: PublicationMediaVerification
}

// --- Job --------------------------------------------------------------------------------------

export interface PublicationJob {
  publicationId: string
  status: PublicationStatus
  // Số, tăng mỗi lần job đổi trạng thái. Dùng cho retry/cancel/recheck/resolve và đổi/hủy lịch.
  revision: number
  requestedBy: string
  createdAt: string
  updatedAt: string
  completedAt: string | null
  attemptCount: number
  canRetry: boolean
  externalPostId: string | null
  // Có thể null ngay cả khi Succeeded: đọc permalink lỗi không làm mất kết quả đã đăng
  externalPostUrl: string | null
  errorCode: string | null
  // Đã gửi lệnh đăng và chưa chắc kết quả. Còn `true` thì tuyệt đối không mở nút đăng lại.
  publishMayHaveOccurred: boolean
  // Mốc 14. Job đăng ngay trả null. Job đã Cancelled/Succeeded/Failed giữ giờ lịch sử,
  // không có nghĩa là còn lịch chờ chạy.
  scheduledAt: string | null
}

export interface PublicationAttempt {
  number: number
  // `Prepare` (dựng media) hay `Publish` (gửi bài); một job Succeeded vẫn có attempt `Continue`
  operation: string
  status: string
  startedAt: string
  completedAt: string | null
  errorCode: string | null
  // Mã đã lọc của provider, không bao giờ chứa token hay raw response
  providerCode: string | null
  providerRequestId: string | null
  externalPostId: string | null
}

export const PublicationReviewAction = {
  ConfirmPublished: 'ConfirmPublished',
  ConfirmNotPublished: 'ConfirmNotPublished',
  Close: 'Close',
  // Backend tự ghi khi Admin đổi giờ lịch (mốc 14), FE không gửi action này
  Reschedule: 'Reschedule'
} as const

export type PublicationReviewAction = (typeof PublicationReviewAction)[keyof typeof PublicationReviewAction]

export type PublicationResolveAction = Exclude<PublicationReviewAction, typeof PublicationReviewAction.Reschedule>

// Append-only: mỗi thao tác đối soát ghi lại actor/thời điểm/ghi chú, không sửa được
export interface PublicationReview {
  action: PublicationReviewAction
  note: string
  actor: string
  createdAt: string
  externalPostId: string | null
}

// Detail KHÔNG phải một `PublicationJob` phẳng: backend bọc job vào một khoá riêng. Đọc thẳng
// `detail.status` sẽ ra `undefined` và giao diện in ra khoá i18n thay vì trạng thái.
export interface PublicationDetail {
  job: PublicationJob
  snapshot: PublicationSnapshot
  attempts: PublicationAttempt[]
  reviews: PublicationReview[]
}

export type PublicationPage = BasePaginationResponse<PublicationJob>['value']

// --- Chỉ số sau khi đăng ----------------------------------------------------------------------

// Chỉ Facebook/Instagram và job `Succeeded`. Nền tảng không trả chỉ số nào thì field đó là null,
// khác với 0 - null là không có dữ liệu chứ không phải chưa ai tương tác.
export interface PublicationInsightMetrics {
  views: number | null
  reach: number | null
  likes: number | null
  comments: number | null
  saved: number | null
  shares: number | null
  total_interactions: number | null
}

export interface PublicationInsights {
  metrics: PublicationInsightMetrics
}

// --- Request bodies ---------------------------------------------------------------------------

export interface PublishPublicationBody {
  accountId: string
  // Giữ NGUYÊN khi retry HTTP vì mất mạng. Đổi key để vượt 409 là sai: backend coi đó là một
  // yêu cầu khác và có thể đăng thành hai bài.
  idempotencyKey: string
  // Hash chuỗi từ preview
  expectedRevision: string
}

export interface SchedulePublicationBody extends PublishPublicationBody {
  // ISO 8601 có giây VÀ offset (`+07:00` hoặc `Z`). Chuỗi `datetime-local` thiếu offset bị
  // backend từ chối bằng PUBLICATION_SCHEDULE_OFFSET_REQUIRED.
  scheduledAt: string
}

export interface ReschedulePublicationBody {
  publicationId: string
  // Số revision của job, không phải hash preview
  expectedRevision: number
  scheduledAt: string
}

export interface PublicationRevisionBody {
  expectedRevision: number
}

export interface ResolvePublicationBody extends PublicationRevisionBody {
  action: PublicationResolveAction
  // Bắt buộc với ConfirmPublished. Backend vẫn đối chiếu qua adapter: xác nhận của Admin không
  // tự ép job sang Succeeded.
  externalPostId?: string | null
  // Bắt buộc với mọi action
  note: string
}

export interface GetPublicationsParams {
  pageIndex?: number
  pageSize?: number
}
