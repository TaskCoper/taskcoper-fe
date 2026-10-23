import type { BasePaginationResponse } from '@/lib/axios'
import type { MarketingPostImageRatio } from './image-ratios'
import type { PublicationStatus } from './publications/types'

export const MarketingPostChannel = {
  Facebook: 'facebook',
  Instagram: 'instagram',
  ZaloOa: 'zaloOa'
} as const

export type MarketingPostChannel = (typeof MarketingPostChannel)[keyof typeof MarketingPostChannel]

export const MarketingPostStatus = {
  Draft: 'draft',
  Scheduled: 'scheduled',
  Published: 'published',
  Failed: 'failed'
} as const

export type MarketingPostStatus = (typeof MarketingPostStatus)[keyof typeof MarketingPostStatus]

export interface MarketingPostItem {
  id: string
  title: string
  excerpt: string
  thumbnailUrl: string | null
  channel: MarketingPostChannel
  status: MarketingPostStatus
  // Null khi bài còn là nháp - chưa hẹn lịch và cũng chưa đẩy lên kênh nào
  publishedAt: string | null
  createdAt: string
}

// Nội dung thô người dùng nhập lúc tạo bài. AI đọc cái này rồi viết lại theo giọng của từng
// nền tảng và cắt ảnh về tỉ lệ nền tảng đó yêu cầu - nên ảnh gốc ở đây tỉ lệ tự do.
export interface MarketingPostSource {
  content: string
  imageUrls: string[]
  createdAt: string
}

export interface MarketingPostDetail extends MarketingPostItem {
  content: string
  hashtags: string[]
  imageUrls: string[]
  // Chỉ có khi bài đã lên kênh - dùng để mở bài gốc trên Facebook/Instagram/Zalo OA
  channelPostUrl: string | null
  // Chỉ có khi status = failed
  failureReason: string | null
  updatedAt: string
  source: MarketingPostSource
}

// Mỗi ảnh gốc admin tự chọn muốn AI xuất ra những tỉ lệ nào - ảnh này 3 tỉ lệ, ảnh kia 2 tỉ lệ đều được
export interface CreateMarketingPostImage {
  url: string
  name: string
  ratios: MarketingPostImageRatio[]
}

export interface CreateMarketingPostBody {
  title: string
  content: string
  hashtags: string[]
  images: CreateMarketingPostImage[]
  // Mỗi kênh được chọn sẽ sinh ra một bài đăng riêng, cùng chung một nội dung gốc
  channels: MarketingPostChannel[]
}

export interface UpdateMarketingPostBody {
  content: string
  hashtags: string[]
}

export interface GetMarketingPostsParams {
  pageIndex?: number
  pageSize?: number
  keyword?: string
  platform?: MarketingPostPlatform
  // Trạng thái lần đăng. Backend dev chưa lọc theo param này - gửi lên là bỏ qua.
  status?: PublicationStatus
}

export type MarketingPostPage = BasePaginationResponse<MarketingPostListItem>['value']

// --- Hợp đồng PostCore của backend -----------------------------------------------------------

// Backend gọi Zalo OA là `zalo`. Giữ riêng với MarketingPostChannel để những màn còn chạy mock
// không bị kéo theo, gỡ mock xong thì gộp lại một enum.
export const MarketingPostPlatform = {
  Facebook: 'facebook',
  Instagram: 'instagram',
  Zalo: 'zalo'
} as const

export type MarketingPostPlatform = (typeof MarketingPostPlatform)[keyof typeof MarketingPostPlatform]

export const marketingPostPlatforms = Object.values(MarketingPostPlatform)

// Trạng thái nằm ở từng nền tảng chứ không nằm ở bài gốc: một bài có thể đã đăng Facebook
// nhưng vẫn đang sinh nội dung cho Instagram.
export const MarketingPostPlatformStatus = {
  Draft: 'Draft',
  Generating: 'Generating',
  Generated: 'Generated',
  Failed: 'Failed',
  Ready: 'Ready',
  Scheduled: 'Scheduled',
  Publishing: 'Publishing',
  Published: 'Published',
  PublishFailed: 'PublishFailed',
  Partial: 'Partial'
} as const

export type MarketingPostPlatformStatus = (typeof MarketingPostPlatformStatus)[keyof typeof MarketingPostPlatformStatus]

// Đã hẹn lịch, đang đăng hoặc đã lên nền tảng thì Studio khoá sửa. Đăng lỗi thì KHÔNG khoá:
// admin phải sửa được nội dung/ảnh (vd đổi ảnh sang JPEG cho Instagram) rồi đăng lại.
export const isLockedForEditingStatus = (status: MarketingPostPlatformStatus) =>
  status === MarketingPostPlatformStatus.Scheduled ||
  status === MarketingPostPlatformStatus.Publishing ||
  status === MarketingPostPlatformStatus.Published

// Bài có nền tảng nào đã bước vào khâu đăng thì không cho xoá. Tính cả đăng lỗi: lần đăng
// hỏng vẫn có thể đã lên nền tảng một phần.
export const isPublishingStatus = (status: MarketingPostPlatformStatus) =>
  isLockedForEditingStatus(status) || status === MarketingPostPlatformStatus.PublishFailed

export const MarketingPostRatioCode = {
  Square1x1: 'Square1x1',
  Portrait4x5: 'Portrait4x5',
  Portrait3x4: 'Portrait3x4',
  Story9x16: 'Story9x16',
  Landscape16x9: 'Landscape16x9'
} as const

export type MarketingPostRatioCode = (typeof MarketingPostRatioCode)[keyof typeof MarketingPostRatioCode]

// Phần chung của bài gốc giữa danh sách và chi tiết
export interface MarketingPostSummary {
  basePostId: string
  title: string
  content: string
  // Một chuỗi, không phải mảng
  hashtag: string | null
  createdAt: string
  updatedAt: string | null
}

// Một dòng con của bài: mỗi nền tảng của bài, kèm lần đăng nếu đã từng đăng. Đã có lần đăng thì
// `status` là trạng thái lần đăng và nội dung/ảnh là bản đã đẩy lên lúc đó. Chưa từng đăng thì
// `publicationId` null và `status` là trạng thái nền tảng. Hai bộ trạng thái trùng tên `Failed`
// nhưng nghĩa khác nhau (đăng hỏng / sinh nội dung hỏng), nên phải xét `publicationId` trước.
export interface MarketingPostPublicationChild {
  publicationId: string | null
  platformPostId: string
  platformAccountId: string | null
  platform: MarketingPostPlatform
  status: PublicationStatus | MarketingPostPlatformStatus
  title: string | null
  content: string
  hashtag: string | null
  imageUrls: string[]
  externalPostId: string | null
  externalPostUrl: string | null
  publishedAt: string | null
}

// Item của danh sách. Không có ảnh gốc hay trạng thái nền tảng - chỉ kèm các lần đăng.
// Dòng con đã có lần đăng thật - chỉ loại này mới có chỉ số và link bài
export type MarketingPostPublishedChild = MarketingPostPublicationChild & {
  publicationId: string
  status: PublicationStatus
}

export const isPublicationChild = (child: MarketingPostPublicationChild): child is MarketingPostPublishedChild =>
  child.publicationId !== null

export interface MarketingPostListItem extends MarketingPostSummary {
  children: MarketingPostPublicationChild[]
}

export interface MarketingPostBaseImage {
  id: string
  imageUrl: string
  sortOrder: number
  width: number | null
  height: number | null
}

export interface MarketingPostContentVersionBase {
  generationId: string
  parentGeneratedPostId: string | null
  versionNo: number
  source: 'Ai' | 'Manual'
  title: string | null
  content: string
  hashtag: string | null
  createdAt: string
}

export interface MarketingPostOfficialImage {
  sourceBasePostImageId: string
  ratioCode: MarketingPostRatioCode
  selectedGeneratedPostImageId: string
  imageUrl: string
  pixelWidth: number
  pixelHeight: number
  sortOrder: number
}

export interface MarketingPostPlatformDetail {
  platformPostId: string
  platform: MarketingPostPlatform
  status: MarketingPostPlatformStatus
  lastError: string | null
  // Null khi chưa chốt bản nội dung nào. Lịch sử version có API riêng, mốc sau mới có.
  content: MarketingPostContentVersionBase | null
  images: MarketingPostOfficialImage[]
}

export interface MarketingPostCoreDetail extends MarketingPostSummary {
  baseImages: MarketingPostBaseImage[]
  platforms: MarketingPostPlatformDetail[]
  // GET chi tiết có kèm các lần đăng, còn response của mấy API ghi (sinh, lưu ảnh...) thì không
  children?: MarketingPostPublicationChild[]
}

export interface MarketingPostImagePayload {
  // Bỏ trống khi thêm ảnh mới, gửi id cũ khi muốn giữ ảnh đang có
  id?: string | null
  imageUrl: string
  sortOrder: number
  width?: number | null
  height?: number | null
}

export interface SaveMarketingPostBody {
  title: string
  content: string
  hashtag: string | null
  images: MarketingPostImagePayload[]
}

// Mốc 4: chọn sinh phần nào. Bỏ field thì backend hiểu là `all`.
export const MarketingPostGenerateMode = {
  Content: 'content',
  Images: 'images',
  All: 'all'
} as const

export type MarketingPostGenerateMode = (typeof MarketingPostGenerateMode)[keyof typeof MarketingPostGenerateMode]

export interface MarketingPostRatioRequest {
  ratioCode: MarketingPostRatioCode
  // Bỏ trống nghĩa là mọi ảnh nguồn của bài
  basePostImageIds: string[]
}

export interface MarketingPostPlatformRequest {
  platform: MarketingPostPlatform
  ratios?: MarketingPostRatioRequest[]
  // Đọc preset tỉ lệ trong Config của nền tảng. Không gửi cùng `ratios`.
  usePreset?: boolean
}

export interface GenerateMarketingPostBody {
  mode?: MarketingPostGenerateMode
  platforms: MarketingPostPlatformRequest[]
}

// --- Mốc 5: version nội dung ------------------------------------------------------------------

export interface MarketingPostContentVersion extends MarketingPostContentVersionBase {
  feedback: string | null
  isOfficial: boolean
}

export interface MarketingPostContentHistory {
  platformPostId: string
  platform: MarketingPostPlatform
  // Null khi nền tảng chưa chốt bản nào
  officialGenerationId: string | null
  // Sắp từ cũ tới mới. `versionNo` tính theo nền tảng, không dùng làm định danh.
  versions: MarketingPostContentVersion[]
}

export interface RegenerateMarketingContentBody {
  // Bỏ trống thì AI làm lại từ bài gốc, không lấy bản đang chốt
  sourceGenerationId?: string | null
  feedback?: string | null
}

export interface UpdateMarketingContentBody {
  title: string | null
  content: string
  hashtag: string | null
}

export interface SelectMarketingContentBody {
  generationId: string
}

// --- Mốc 6: version ảnh -----------------------------------------------------------------------

export const MarketingPostImageStatus = {
  Succeeded: 'Succeeded',
  Failed: 'Failed'
} as const

export type MarketingPostImageStatus = (typeof MarketingPostImageStatus)[keyof typeof MarketingPostImageStatus]

export interface MarketingPostImageVersion {
  generatedPostImageId: string
  sourceBasePostImageId: string
  ratioCode: MarketingPostRatioCode
  parentGeneratedPostImageId: string | null
  versionNo: number
  sourceImageUrl: string
  // Null khi lượt sinh đó lỗi
  imageUrl: string | null
  pixelWidth: number
  pixelHeight: number
  status: MarketingPostImageStatus
  errorMessage: string | null
  feedback: string | null
  createdAt: string
  // Những nền tảng đang chốt đúng bản này
  selectedPlatforms: MarketingPostPlatform[]
}

// Kho ảnh gom theo cặp ảnh nguồn × tỉ lệ - đúng đơn vị mà một ô ảnh đại diện
export interface MarketingPostImageGroup {
  sourceBasePostImageId: string
  originalImageUrl: string
  sourceIsDeleted: boolean
  ratioCode: MarketingPostRatioCode
  versions: MarketingPostImageVersion[]
}

export interface MarketingPostImageHistory {
  basePostId: string
  groups: MarketingPostImageGroup[]
}

export interface RegenerateMarketingImageBody {
  sourceBasePostImageId: string
  ratioCode: MarketingPostRatioCode
  // Bỏ trống thì dựng lại từ ảnh gốc, gửi ID thì sửa tiếp trên bản đó
  sourceGeneratedPostImageId?: string | null
  feedback?: string | null
}

export interface MarketingPostImageSlot {
  sourceBasePostImageId: string
  ratioCode: MarketingPostRatioCode
  // Null nghĩa là giữ ô nhưng chưa chốt bản nào
  selectedGeneratedPostImageId: string | null
  sortOrder: number
}

export interface UpdateMarketingPlatformImagesBody {
  images: MarketingPostImageSlot[]
}

// --- Mốc 7: bản chốt --------------------------------------------------------------------------

export const MarketingPostNotReadyReason = {
  MissingContent: 'MissingContent',
  MissingImages: 'MissingImages',
  GenerationInProgress: 'GenerationInProgress',
  PublishingState: 'PublishingState'
} as const

export type MarketingPostNotReadyReason = (typeof MarketingPostNotReadyReason)[keyof typeof MarketingPostNotReadyReason]

export interface MarketingPostOfficial {
  basePostId: string
  platformPostId: string
  platform: MarketingPostPlatform
  // Mô tả payload lúc đọc, không phải trạng thái xử lý trong database
  status: MarketingPostPlatformStatus
  isReady: boolean
  notReadyReasons: MarketingPostNotReadyReason[]
  generationId: string | null
  title: string | null
  content: string | null
  hashtag: string | null
  selectedAt: string | null
  images: MarketingPostOfficialImage[]
}
