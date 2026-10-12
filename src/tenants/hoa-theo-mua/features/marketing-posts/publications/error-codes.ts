// Mã lỗi của luồng đăng. Backend cam kết `errorCode` là mã ổn định (provider code/request ID đã
// được lọc), nên dịch thẳng sang tiếng Việt thay vì hiện chuỗi Meta trả về.

// Lỗi liên quan tới một ảnh cụ thể có hậu tố `_N` với N là `order` của ảnh trong snapshot.
// Ví dụ `INSTAGRAM_JPEG_REQUIRED_2` nghĩa là ảnh thứ 2 không phải JPEG.
const IMAGE_ORDER_SUFFIX = /_(\d+)$/

export interface ParsedPublicationError {
  // Mã gốc backend trả, luôn giữ để hiện cho admin đối chiếu với log
  code: string
  // Mã đã bỏ hậu tố order
  baseCode: string
  // Thứ tự ảnh gây lỗi, null nếu lỗi không thuộc về ảnh nào
  imageOrder: number | null
}

export const parsePublicationErrorCode = (code: string): ParsedPublicationError => {
  const matched = code.match(IMAGE_ORDER_SUFFIX)

  if (!matched) return { code, baseCode: code, imageOrder: null }

  return { code, baseCode: code.slice(0, matched.index), imageOrder: Number(matched[1]) }
}

// baseCode -> hậu tố khoá i18n dưới `marketingPosts.publication.error.*`
const publicationErrorKeys: Record<string, string> = {
  ZALO_TITLE_INVALID: 'zaloTitleInvalid',
  ZALO_ARTICLE_METADATA_INVALID: 'zaloMetadataInvalid',
  ZALO_IMAGE_FORMAT_INVALID: 'zaloImageInvalid',
  ZALO_TOKEN_INVALID: 'zaloTokenInvalid',
  ZALO_PERMISSION_DENIED: 'zaloPermissionDenied',
  ZALO_RATE_LIMITED: 'zaloRateLimited',
  ZALO_REQUEST_REJECTED: 'zaloRejected',
  ZALO_PROCESSING: 'zaloProcessing',
  ZALO_PROCESS_REFERENCE_MISSING: 'zaloUnverified',
  ZALO_PUBLICATION_UNVERIFIED: 'zaloUnverified',
  ZALO_CREATE_ALREADY_SENT: 'zaloUnverified',
  ZALO_INVALID_RESPONSE: 'zaloUnverified',
  ZALO_TIMEOUT: 'zaloUnavailable',
  ZALO_TRANSPORT_ERROR: 'zaloUnavailable',
  ZALO_UNAVAILABLE: 'zaloUnavailable',
  ZALO_PUBLISHING_CONFIG_INVALID: 'zaloConfigInvalid',
  ZALO_INVALID_TARGET: 'accountMismatch',

  // Mốc 12 - xung đột trạng thái và cấu hình
  PUBLICATION_PREVIEW_CHANGED: 'previewChanged',
  PUBLICATION_CHANGED: 'publicationChanged',
  IDEMPOTENCY_CONFLICT: 'idempotencyConflict',
  PUBLICATION_EXISTS: 'publicationExists',
  PUBLICATION_LOCKED: 'publicationLocked',
  PUBLICATION_RETRY_NOT_ALLOWED: 'retryNotAllowed',
  PUBLICATION_CANCEL_NOT_ALLOWED: 'cancelNotAllowed',
  PUBLICATION_REVIEW_NOT_ALLOWED: 'reviewNotAllowed',
  PUBLISHING_DISABLED: 'publishingDisabled',
  PUBLISHING_ADAPTER_UNAVAILABLE: 'adapterUnavailable',

  // Ba mã dưới đây không có trong contract, đo được từ `reasons` của preview trên API thật
  PUBLICATION_IMAGE_COUNT_INVALID: 'imageCountInvalid',
  PLATFORM_ACCOUNT_MISMATCH: 'accountMismatch',
  // Nền tảng còn kẹt ở `Partial` sau một lượt cắt lỗi; chốt lại tập ảnh là backend tính lại
  INVALID_SELECTED_IMAGE: 'invalidSelectedImage',

  // Mốc 13 - adapter Meta
  META_TOKEN_INVALID: 'metaTokenInvalid',
  META_PERMISSION_DENIED: 'metaPermissionDenied',
  META_RATE_LIMITED: 'metaRateLimited',
  META_INVALID_MEDIA_OR_PARAMETER: 'metaInvalidMediaOrParameter',
  INSTAGRAM_QUOTA_UNVERIFIED: 'instagramQuotaUnverified',
  INSTAGRAM_PUBLISHED_ID_UNRESOLVED: 'instagramPublishedIdUnresolved',
  PUBLICATION_MEDIA_EXPIRED: 'mediaExpired',
  INSTAGRAM_JPEG_REQUIRED: 'instagramJpegRequired',
  INSTAGRAM_IMAGE_DIMENSIONS_INVALID: 'instagramDimensionsInvalid',
  INSTAGRAM_CAROUSEL_SQUARE_REQUIRED: 'instagramCarouselSquareRequired',
  FACEBOOK_IMAGE_FORMAT_INVALID: 'facebookImageFormatInvalid',

  // Mốc 14 - lịch đăng
  PUBLICATION_SCHEDULE_OFFSET_REQUIRED: 'scheduleOffsetRequired',
  PUBLICATION_SCHEDULE_OUT_OF_RANGE: 'scheduleOutOfRange',
  PUBLICATION_SCHEDULE_NOT_FOUND: 'scheduleNotFound',
  PUBLICATION_SCHEDULE_NOT_EDITABLE: 'scheduleNotEditable',
  PUBLICATION_SCHEDULE_MISSED: 'scheduleMissed',

  // Chỉ số sau khi đăng
  INSIGHTS_PERMISSION_REQUIRED: 'insightsPermissionRequired',
  PLATFORM_REAUTH_REQUIRED: 'platformReauthRequired'
}

// Backend viết mã theo hai kiểu cho cùng một thứ: `messageCode` của lỗi dùng SCREAMING_SNAKE,
// còn `reasons` của preview trộn cả SCREAMING_SNAKE lẫn PascalCase của mốc 7 (`MISSING_IMAGES`
// và `MissingImages` là một). Chuẩn hoá về một dạng thay vì chép mỗi mã hai lần.
const normalizeCode = (code: string) => code.replaceAll('_', '').toUpperCase()

const toLookup = (keys: Record<string, string>) =>
  new Map(Object.entries(keys).map(([code, key]) => [normalizeCode(code), key]))

const publicationErrorLookup = toLookup(publicationErrorKeys)

// Họ `MEDIA_*` chưa được contract liệt kê hết tên thành viên, chỉ nói dạng `MEDIA_*_{order}`.
// Gom về một câu chung thay vì để lọt mã trần ra giao diện.
const MEDIA_ERROR_PREFIX = 'MEDIA_'

export const getPublicationErrorKey = (baseCode: string) => {
  const key = publicationErrorLookup.get(normalizeCode(baseCode))
  if (key) return key

  return baseCode.startsWith(MEDIA_ERROR_PREFIX) ? 'mediaInvalid' : null
}

// `reasons` của preview chưa được contract liệt kê hết. Thực tế nó trộn hai họ: mã lỗi của
// luồng đăng và lý do chưa sẵn sàng của bản chốt (mốc 7). Thử dịch theo cả hai, không ra thì
// để người gọi bọc mã vào một câu tiếng Việt - đừng bắn mã trần ra giao diện.
const notReadyReasonKeys: Record<string, string> = {
  MISSING_CONTENT: 'missingContent',
  MISSING_IMAGES: 'missingImages',
  GENERATION_IN_PROGRESS: 'generationInProgress',
  PUBLISHING_STATE: 'publishingState'
}

const notReadyReasonLookup = toLookup(notReadyReasonKeys)

// Trả về đường dẫn i18n đầy đủ vì hai họ nằm ở hai nhánh khác nhau, hoặc null khi không dịch được
export const getPublicationReasonLabelKey = (reason: string) => {
  const { baseCode } = parsePublicationErrorCode(reason)
  const errorKey = getPublicationErrorKey(baseCode)
  if (errorKey) return `marketingPosts.publication.error.${errorKey}`

  const notReadyKey = notReadyReasonLookup.get(normalizeCode(reason))

  return notReadyKey ? `marketingPosts.publication.reason.${notReadyKey}` : null
}

// Token chết hoặc mất quyền: phải kết nối lại tài khoản trước, retry suông không cứu được
const reauthErrorCodes = [
  'ZALO_TOKEN_INVALID',
  'ZALO_PERMISSION_DENIED',
  'META_TOKEN_INVALID',
  'META_PERMISSION_DENIED',
  'PLATFORM_REAUTH_REQUIRED',
  'INSIGHTS_PERMISSION_REQUIRED'
]

export const needsAccountReauth = (code: string | null) =>
  Boolean(code) && reauthErrorCodes.includes(parsePublicationErrorCode(code as string).baseCode)

// Lỗi do file/lựa chọn ảnh: cách sửa là chọn lại ảnh rồi lấy preview mới và tạo job MỚI,
// vì retry giữ nguyên snapshot cũ nên sẽ hỏng y hệt.
export const isImageErrorCode = (code: string | null) => {
  if (!code) return false

  const { baseCode, imageOrder } = parsePublicationErrorCode(code)

  return imageOrder !== null || baseCode.startsWith(MEDIA_ERROR_PREFIX)
}

// Provider đang chặn theo hạn mức. Retry sớm trả HTTP 429 nên nút phải chờ, không vòng lặp.
export const isRateLimitedCode = (code: string | null) =>
  Boolean(code) && ['META_RATE_LIMITED', 'ZALO_RATE_LIMITED'].includes(parsePublicationErrorCode(code as string).baseCode)
