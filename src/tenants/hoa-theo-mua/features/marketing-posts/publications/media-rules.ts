import { MarketingPostPlatform } from '../types'
import { publicationSnapshotPlatforms, type PublicationSnapshot } from './types'

// Giới hạn mốc 13. Đây là bản chép lại của contract để cảnh báo SỚM trên giao diện; người gác
// cổng thật vẫn là worker - nó tải file về đọc MIME, chữ ký và header nên có thể từ chối cả
// những ảnh mà bảng này cho qua (URL redirect, file hỏng sau header, ảnh đổi ở đầu bên kia).

export interface PublicationMediaRule {
  maxImages: number
  // Null nghĩa là contract chưa xác minh giới hạn nào - không bịa một con số
  captionMaxScalars: number | null
  captionMaxHashtags: number | null
  captionMaxMentions: number | null
}

export const publicationMediaRules: Partial<Record<MarketingPostPlatform, PublicationMediaRule>> = {
  [MarketingPostPlatform.Facebook]: {
    maxImages: 10,
    // Facebook chưa có giới hạn text nào được xác minh, nên không chặn theo số đoán
    captionMaxScalars: null,
    captionMaxHashtags: null,
    captionMaxMentions: null
  },
  [MarketingPostPlatform.Instagram]: {
    maxImages: 10,
    captionMaxScalars: 2200,
    captionMaxHashtags: 30,
    captionMaxMentions: 20
  }
}

// Instagram đếm caption theo Unicode scalar, không phải UTF-16 code unit. `"👩‍👩‍👦".length` là 8
// nhưng chỉ có 5 scalar - đếm bằng `.length` sẽ báo vượt hạn oan với caption nhiều emoji.
export const countUnicodeScalars = (text: string) => [...text].length

const HASHTAG_PATTERN = /#[^\s#@]+/g
const MENTION_PATTERN = /@[^\s#@]+/g

export const countHashtags = (text: string) => text.match(HASHTAG_PATTERN)?.length ?? 0

export const countMentions = (text: string) => text.match(MENTION_PATTERN)?.length ?? 0

export interface PublicationMediaIssue {
  key: string
  // `error` là thứ chắc chắn bị từ chối, `warning` là thứ admin được quyền bỏ qua
  level: 'error' | 'warning'
  imageOrder?: number
  values?: Record<string, number | string>
}

// Soát snapshot trước khi bấm đăng. Trả rỗng nghĩa là không thấy gì đáng ngờ trong dữ liệu đã
// lưu - vẫn không bảo đảm Meta chấp nhận, vì `mediaVerification` luôn là `Unverified`.
//
// Snapshot chỉ mang `order`/`url`/`generationId` cho mỗi ảnh, KHÔNG có kích thước pixel, nên
// mọi luật về chiều rộng, tỉ lệ hay album phải vuông của Instagram không kiểm được ở đây -
// worker mới là nơi đọc file thật và từ chối.
export const getPublicationMediaIssues = (snapshot: PublicationSnapshot): PublicationMediaIssue[] => {
  const rule = publicationMediaRules[publicationSnapshotPlatforms[snapshot.platform]]
  if (!rule) return []

  const issues: PublicationMediaIssue[] = []

  // Không kiểm thiếu ảnh ở đây: checklist của Studio và `reasons` của preview đều đã nói,
  // thêm dòng thứ ba chỉ làm rối. Thiếu ảnh cũng không phải thứ FE chặn - admin tự quyết.
  if (snapshot.images.length > rule.maxImages) {
    issues.push({ key: 'tooManyImages', level: 'error', values: { max: rule.maxImages } })
  }

  // Giới hạn caption là thứ FE biết chắc và phải chặn. Không tự cắt text hay bỏ hashtag hộ.
  const { text } = snapshot

  if (rule.captionMaxScalars !== null) {
    const length = countUnicodeScalars(text)

    if (length > rule.captionMaxScalars) {
      issues.push({
        key: 'captionTooLong',
        level: 'error',
        values: { max: rule.captionMaxScalars, current: length }
      })
    }
  }

  if (rule.captionMaxHashtags !== null) {
    const count = countHashtags(text)

    if (count > rule.captionMaxHashtags) {
      issues.push({ key: 'tooManyHashtags', level: 'error', values: { max: rule.captionMaxHashtags, current: count } })
    }
  }

  if (rule.captionMaxMentions !== null) {
    const count = countMentions(text)

    if (count > rule.captionMaxMentions) {
      issues.push({ key: 'tooManyMentions', level: 'error', values: { max: rule.captionMaxMentions, current: count } })
    }
  }

  return issues
}

export const hasBlockingMediaIssue = (issues: PublicationMediaIssue[]) =>
  issues.some((issue) => issue.level === 'error')
