import type { MarketingPostImageRatio } from '../image-ratios'
import { MarketingPostNotReadyReason } from '../types'
import { isPreferredRatio, marketingPostChannelRules } from './channel-rules'
import {
  MarketingStudioPublishMode,
  type MarketingStudioCaptionEdit,
  type MarketingStudioChannelDraft,
  type MarketingStudioIssue,
  type MarketingStudioPoolImage
} from './types'

export const getActiveRevision = (channelDraft: MarketingStudioChannelDraft) =>
  channelDraft.revisions.find((revision) => revision.revision === channelDraft.activeRevision) ?? null

// Nội dung thật sự sẽ đăng: bài của lượt đang xem, có bản sửa tay thì lấy bản sửa tay
export const resolveMarketingStudioCaption = (
  channelDraft: MarketingStudioChannelDraft
): MarketingStudioCaptionEdit | null => {
  const revision = getActiveRevision(channelDraft)
  if (!revision) return null

  return channelDraft.edits[revision.revision] ?? revision.caption
}

export const isMarketingStudioCaptionEdited = (channelDraft: MarketingStudioChannelDraft) =>
  Boolean(channelDraft.edits[channelDraft.activeRevision])

// Ảnh mà riêng kênh này nhìn thấy. Version là lựa chọn của từng kênh, không phải của pool,
// nên phải phân giải qua đây ở mọi chỗ hiển thị và lúc chốt bài.
export const resolveChannelImage = (
  image: MarketingStudioPoolImage,
  channelDraft?: MarketingStudioChannelDraft
): MarketingStudioPoolImage => {
  const attempt = channelDraft?.imageVersions[image.id]
  if (attempt === undefined) return image

  const version = image.versions.find((item) => item.attempt === attempt)

  return version ? { ...image, attempt: version.attempt, url: version.url } : image
}

export const resolveChannelImages = (channelDraft: MarketingStudioChannelDraft, pool: MarketingStudioPoolImage[]) =>
  channelDraft.imageIds
    .map((imageId) => pool.find((image) => image.id === imageId))
    .filter((image): image is MarketingStudioPoolImage => Boolean(image))
    .map((image) => resolveChannelImage(image, channelDraft))

// Soát từng kênh trước khi chốt. `error` chặn nút lưu, `warning` chỉ nhắc.
export const getMarketingStudioIssues = (
  channelDraft: MarketingStudioChannelDraft,
  pool: MarketingStudioPoolImage[],
  // Lý do backend trả về ở API bản chốt. Nó thấy cả những thứ detail không trả nên đặt lên trước.
  notReadyReasons: MarketingPostNotReadyReason[] = []
): MarketingStudioIssue[] => {
  // Bài đã đăng thì không sửa được nữa nên cũng chẳng có gì để soát, và nhất là không được
  // chặn nút lưu của những kênh mới thêm vào
  if (channelDraft.isLocked) return []

  // Đang sinh dở thì thiếu nội dung, thiếu ảnh đều là chuyện đương nhiên - kể ra chỉ tổ
  // làm admin tưởng hỏng. Chỉ báo đúng một dòng "đang chạy" rồi thôi.
  if (notReadyReasons.includes(MarketingPostNotReadyReason.GenerationInProgress)) {
    return [{ key: MarketingPostNotReadyReason.GenerationInProgress, level: 'warning' }]
  }

  const { captionMax, maxImages, unsupportedRatios, albumRatio } = marketingPostChannelRules[channelDraft.channel]
  const caption = resolveMarketingStudioCaption(channelDraft)
  // Thiếu ảnh không chặn: Facebook đăng bài chỉ có chữ vẫn được, admin tự quyết.
  const issues: MarketingStudioIssue[] = notReadyReasons.map((reason) => ({
    key: reason,
    level: reason === MarketingPostNotReadyReason.MissingImages ? 'warning' : 'error'
  }))

  if (!caption) {
    if (!notReadyReasons.includes(MarketingPostNotReadyReason.MissingContent)) {
      issues.push({ key: 'noCaption', level: 'error' })
    }
  } else if (caption.content.length > captionMax) {
    issues.push({ key: 'captionTooLong', level: 'error', values: { max: captionMax } })
  }

  if (channelDraft.imageIds.length > maxImages) {
    issues.push({ key: 'tooManyImages', level: 'error', values: { max: maxImages } })
  }

  if (
    channelDraft.publishMode === MarketingStudioPublishMode.Schedule &&
    (!channelDraft.scheduledAt || new Date(channelDraft.scheduledAt).getTime() <= Date.now())
  ) {
    issues.push({ key: 'scheduleInvalid', level: 'error' })
  }

  if (channelDraft.imageIds.length === 0 && !notReadyReasons.includes(MarketingPostNotReadyReason.MissingImages)) {
    issues.push({ key: 'noImages', level: 'warning' })
  }

  const selectedRatios = channelDraft.imageIds
    .map((imageId) => pool.find((item) => item.id === imageId)?.ratio)
    .filter((ratio): ratio is MarketingPostImageRatio => Boolean(ratio))

  // Tỉ lệ nền tảng từ chối hẳn thì phải chặn, không chỉ nhắc: đăng lên là hỏng chắc chắn
  const unsupported = selectedRatios.filter((ratio) => unsupportedRatios.includes(ratio))

  if (unsupported.length > 0) {
    issues.push({
      key: 'ratioUnsupported',
      level: 'error',
      values: { count: unsupported.length, ratios: [...new Set(unsupported)].join(', ') }
    })
  }

  if (albumRatio && selectedRatios.length > 1 && selectedRatios.some((ratio) => ratio !== albumRatio)) {
    issues.push({ key: 'albumRatioRequired', level: 'error', values: { ratio: albumRatio } })
  }

  // Ảnh đã bị chặn ở trên thì không nhắc thêm lần nữa là "không đẹp"
  const mismatchedCount = selectedRatios.filter(
    (ratio) => !unsupportedRatios.includes(ratio) && !isPreferredRatio(channelDraft.channel, ratio)
  ).length

  if (mismatchedCount > 0) {
    issues.push({ key: 'ratioMismatch', level: 'warning', values: { count: mismatchedCount } })
  }

  return issues
}

export const hasBlockingIssue = (issues: MarketingStudioIssue[]) => issues.some((issue) => issue.level === 'error')
