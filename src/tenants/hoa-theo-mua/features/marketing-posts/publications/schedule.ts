import { PublicationStatus, type PublicationJob } from './types'

// Ngưỡng mặc định của `PublishingOptions` (mốc 14). Backend có thể cấu hình khác và sẽ trả
// PUBLICATION_SCHEDULE_OUT_OF_RANGE - đây chỉ là bản kiểm sớm để không phí một vòng request.
export const SCHEDULE_MIN_LEAD_SECONDS = 60
export const SCHEDULE_MAX_DAYS = 30
// Trễ quá ngưỡng này mà worker chưa nhận: Failed + PUBLICATION_SCHEDULE_MISSED, canRetry=false
export const SCHEDULE_LATENESS_SECONDS = 900

// Ngưỡng cứng là 60 giây tính từ lúc BACKEND nhận request. Admin bấm xong còn qua mạng, nên
// gợi ý một khoảng dư rộng hơn để không trượt biên chỉ vì request đi chậm.
export const SCHEDULE_SUGGESTED_LEAD_SECONDS = 300

const pad = (value: number) => String(value).padStart(2, '0')

// Chuỗi `datetime-local` không mang offset. Gửi thẳng lên backend sẽ ăn
// PUBLICATION_SCHEDULE_OFFSET_REQUIRED, còn `toISOString()` thì quy về UTC và làm mất ý định
// "9 giờ sáng theo giờ admin đang nhìn". Nên gắn đúng offset của trình duyệt - cùng múi giờ mà
// mọi mốc thời gian khác trong app đang hiển thị.
export const toScheduleIso = (datetimeLocal: string | null): string | null => {
  if (!datetimeLocal) return null

  const date = new Date(datetimeLocal)
  if (Number.isNaN(date.getTime())) return null

  // getTimezoneOffset() đếm số phút LÙI so với UTC, nên +07:00 ra -420
  const offsetMinutes = date.getTimezoneOffset()
  const sign = offsetMinutes <= 0 ? '+' : '-'
  const absolute = Math.abs(offsetMinutes)
  const offset = `${sign}${pad(Math.floor(absolute / 60))}:${pad(absolute % 60)}`

  const local = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
  const time = `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`

  return `${local}T${time}${offset}`
}

export const getScheduleBounds = (now = Date.now()) => ({
  earliest: new Date(now + SCHEDULE_MIN_LEAD_SECONDS * 1000),
  suggested: new Date(now + SCHEDULE_SUGGESTED_LEAD_SECONDS * 1000),
  latest: new Date(now + SCHEDULE_MAX_DAYS * 24 * 60 * 60 * 1000)
})

export const ScheduleIssue = {
  Invalid: 'invalid',
  TooSoon: 'tooSoon',
  TooFar: 'tooFar'
} as const

export type ScheduleIssue = (typeof ScheduleIssue)[keyof typeof ScheduleIssue]

// Trả null nghĩa là hợp lệ tại thời điểm kiểm. Biên vẫn có thể trôi giữa lúc kiểm và lúc gửi,
// backend mới là nơi chốt.
export const validateScheduleAt = (datetimeLocal: string | null, now = Date.now()): ScheduleIssue | null => {
  if (!datetimeLocal) return ScheduleIssue.Invalid

  const target = new Date(datetimeLocal).getTime()
  if (Number.isNaN(target)) return ScheduleIssue.Invalid

  const { earliest, latest } = getScheduleBounds(now)

  if (target < earliest.getTime()) return ScheduleIssue.TooSoon
  if (target > latest.getTime()) return ScheduleIssue.TooFar

  return null
}

// Chỉ job còn Scheduled mới hiện nút đổi/hủy lịch. Worker vừa claim thì PUT/DELETE trả 409
// dù ngoài Meta chưa thấy bài - nút bật ở FE không thay được guard của backend.
export const canEditSchedule = (job: Pick<PublicationJob, 'status'>) => job.status === PublicationStatus.Scheduled

// `scheduledAt` của job đã kết thúc là giờ lịch sử, không phải lịch còn chờ chạy
export const hasPendingSchedule = (job: Pick<PublicationJob, 'status' | 'scheduledAt'>) =>
  job.status === PublicationStatus.Scheduled && Boolean(job.scheduledAt)
