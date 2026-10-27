import type { MarketingPostImageRatio } from '../image-ratios'
import type { CreateMarketingPostImage, MarketingPostChannel, MarketingPostRatioCode } from '../types'

export const MarketingStudioJobStatus = {
  Queued: 'queued',
  Running: 'running',
  Done: 'done',
  Failed: 'failed'
} as const

export type MarketingStudioJobStatus = (typeof MarketingStudioJobStatus)[keyof typeof MarketingStudioJobStatus]

// Job ảnh đếm theo (ảnh gốc × tỉ lệ) nên không phụ thuộc chọn bao nhiêu kênh:
// 3 ảnh × 2 tỉ lệ = 6 job ảnh, cộng 1 job caption mỗi kênh.
export interface MarketingStudioImageJob {
  id: string
  kind: 'image'
  status: MarketingStudioJobStatus
  sourceIndex: number
  sourceName: string
  ratio: MarketingPostImageRatio
  // Đếm số lần cắt lại. Mỗi lần cắt lại AI cho ra một bản khác, ảnh cũ bị thay tại chỗ
  // nên kênh nào đang dùng ảnh này vẫn giữ nguyên lựa chọn.
  attempt: number
}

export interface MarketingStudioCaptionJob {
  id: string
  kind: 'caption'
  status: MarketingStudioJobStatus
  channel: MarketingPostChannel
}

export type MarketingStudioJob = MarketingStudioImageJob | MarketingStudioCaptionJob

// Hướng điều chỉnh bấm nhanh khi bảo AI cắt lại một ảnh
export const MarketingStudioImageTweak = {
  ZoomIn: 'zoomIn',
  ZoomOut: 'zoomOut',
  CenterSubject: 'centerSubject',
  Brighter: 'brighter'
} as const

export type MarketingStudioImageTweak = (typeof MarketingStudioImageTweak)[keyof typeof MarketingStudioImageTweak]

export const marketingStudioImageTweaks = [
  MarketingStudioImageTweak.ZoomIn,
  MarketingStudioImageTweak.ZoomOut,
  MarketingStudioImageTweak.CenterSubject,
  MarketingStudioImageTweak.Brighter
]

export interface MarketingStudioImageVersion {
  attempt: number
  url: string
  // Yêu cầu đã gửi cho lượt cắt này, để lịch sử còn nói được vì sao ra bản đó
  tweaks: MarketingStudioImageTweak[]
  note: string
  // Định danh thật của bản ảnh bên backend. `attempt` chỉ là số thứ tự để hiển thị.
  generatedPostImageId: string
  // Lượt cắt lỗi vẫn nằm trong kho để xem lại, nhưng không chốt được
  isFailed: boolean
  errorMessage: string | null
}

// Ảnh AI cắt xong nằm chung một pool, không thuộc riêng kênh nào - kênh nào cũng pick được.
// Nhờ vậy ảnh cắt 16:9 cho Facebook vẫn dùng lại được cho Instagram nếu admin thấy đẹp.
export interface MarketingStudioPoolImage {
  id: string
  sourceIndex: number
  sourceName: string
  ratio: MarketingPostImageRatio
  url: string
  width: number
  height: number
  // Cặp ảnh nguồn × tỉ lệ mà ô này đại diện - đúng khoá backend dùng cho một ô ảnh
  sourceBasePostImageId: string
  ratioCode: MarketingPostRatioCode
  // Bản đang dùng. Cắt lại không xoá bản cũ mà đẩy thêm vào `versions`, admin quay về được.
  attempt: number
  versions: MarketingStudioImageVersion[]
}

export const MarketingStudioPublishMode = {
  Draft: 'draft',
  Schedule: 'schedule',
  PublishNow: 'publishNow'
} as const

export type MarketingStudioPublishMode = (typeof MarketingStudioPublishMode)[keyof typeof MarketingStudioPublishMode]

// Hướng điều chỉnh bấm nhanh khi bảo AI viết lại caption của một kênh
export const MarketingStudioTweak = {
  Shorter: 'shorter',
  MoreEmoji: 'moreEmoji',
  AddCta: 'addCta',
  FewerHashtags: 'fewerHashtags'
} as const

export type MarketingStudioTweak = (typeof MarketingStudioTweak)[keyof typeof MarketingStudioTweak]

export const marketingStudioTweaks = [
  MarketingStudioTweak.Shorter,
  MarketingStudioTweak.MoreEmoji,
  MarketingStudioTweak.AddCta,
  MarketingStudioTweak.FewerHashtags
]

export interface MarketingStudioCaptionEdit {
  title: string | null
  content: string
  hashtags: string[]
}

// Một lượt AI viết cho kênh: mỗi lượt ra đúng một bài. Viết lại không đè lên lượt cũ mà nối thêm
// vào `revisions`, kèm luôn hướng điều chỉnh đã yêu cầu để sau còn biết vì sao ra bản đó.
export interface MarketingStudioCaptionRevision {
  revision: number
  createdAt: string
  caption: MarketingStudioCaptionEdit
  tweaks: MarketingStudioTweak[]
  note: string
  // Định danh thật bên backend; `revision` chỉ là versionNo để hiển thị
  generationId: string
  title: string | null
  isManual: boolean
}

export interface MarketingStudioChannelDraft {
  channel: MarketingPostChannel
  revisions: MarketingStudioCaptionRevision[]
  activeRevision: number
  // Bản sửa tay đè lên bài AI viết, lưu theo từng lượt nên quay qua lượt khác rồi quay lại
  // vẫn còn nguyên bản đã sửa
  edits: Record<number, MarketingStudioCaptionEdit>
  // Kênh đã ưng thì ghim, "viết lại toàn bộ" sẽ chừa nó ra
  isPinned: boolean
  // Bài của kênh này đã đăng ra ngoài rồi: chốt cứng, mọi thao tác sửa đều bị chặn.
  // Sửa ở đây mà ngoài kia không đổi thì hệ thống nói một đằng, bài thật một nẻo.
  isLocked: boolean
  isScheduled?: boolean
  // Thứ tự ảnh riêng từng kênh: cùng hai ảnh nhưng Facebook để ảnh A trước, Instagram để ảnh B trước
  imageIds: string[]
  // Bản cắt mà riêng kênh này đang dùng cho từng ô ảnh (imageId -> attempt).
  // Không có mục nào thì dùng bản mới nhất của pool. Nhờ map này mà Instagram để v1
  // trong khi Facebook để v2 trên cùng một ô ảnh.
  imageVersions: Record<string, number>
  publishMode: MarketingStudioPublishMode
  // Chuỗi datetime-local, chỉ dùng khi publishMode = schedule
  scheduledAt: string | null
}

export interface MarketingStudioDraft {
  id: string
  title: string
  content: string
  hashtags: string[]
  images: CreateMarketingPostImage[]
  channels: MarketingPostChannel[]
  createdAt: string
}

// Trạng thái Studio lưu kèm một bài đã chốt, để mở lại sửa là dựng lại được nguyên trạng:
// ảnh gốc, mọi bản cắt, các lượt AI viết, bản sửa tay. Backend thật cũng cần lưu đúng bộ này,
// nếu chỉ lưu content + imageUrls như bản ghi bài thì sửa lại sẽ mất sạch lịch sử.
export interface MarketingStudioPostState {
  sourceImages: CreateMarketingPostImage[]
  pool: MarketingStudioPoolImage[]
  channelDraft: MarketingStudioChannelDraft
}

export interface MarketingStudioIssue {
  key: string
  level: 'error' | 'warning'
  values?: Record<string, number | string>
}

// Mỗi hàng kênh ở khối chốt đăng tự giữ tài khoản, cách đăng và giờ hẹn của nó, rồi đăng ký
// hàm gửi này lên nút gộp. Hash bản chốt là của riêng từng kênh nên không gom lên cha được.
export type MarketingStudioChannelSender = () => void
