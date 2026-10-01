import { MarketingPostPlatformStatus, MarketingPostStatus } from './types'

// Tông màu badge theo trạng thái, gom về một chỗ để bảng danh sách và trang chi tiết dùng chung
export const marketingPostStatusBadgeClasses: Record<MarketingPostStatus, string> = {
  [MarketingPostStatus.Draft]:
    'border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-800 dark:bg-slate-900/40 dark:text-slate-300',
  [MarketingPostStatus.Scheduled]:
    'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-300',
  [MarketingPostStatus.Published]:
    'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300',
  [MarketingPostStatus.Failed]:
    'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300'
}

// Trạng thái backend nhiều hơn hẳn nên gom về sáu tông cho dễ đọc: xám là chưa làm gì,
// xanh dương là đang chạy, chàm là đã có nội dung, hổ phách là còn thiếu, đỏ là lỗi, lục là xong.
const neutralTone =
  'border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-800 dark:bg-slate-900/40 dark:text-slate-300'
const progressTone = 'border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-900/60 dark:bg-sky-950/40 dark:text-sky-300'
const infoTone =
  'border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-900/60 dark:bg-indigo-950/40 dark:text-indigo-300'
const warningTone =
  'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-300'
const dangerTone =
  'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300'
const successTone =
  'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300'

export const marketingPostPlatformStatusBadgeClasses: Record<MarketingPostPlatformStatus, string> = {
  [MarketingPostPlatformStatus.Draft]: neutralTone,
  [MarketingPostPlatformStatus.Generating]: progressTone,
  [MarketingPostPlatformStatus.Generated]: infoTone,
  [MarketingPostPlatformStatus.Failed]: dangerTone,
  [MarketingPostPlatformStatus.Ready]: infoTone,
  [MarketingPostPlatformStatus.Scheduled]: infoTone,
  [MarketingPostPlatformStatus.Publishing]: progressTone,
  [MarketingPostPlatformStatus.Published]: successTone,
  [MarketingPostPlatformStatus.PublishFailed]: dangerTone,
  [MarketingPostPlatformStatus.Partial]: warningTone
}
