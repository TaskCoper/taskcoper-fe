import { formatDateTime, formatTime } from '@/lib/date'
import { isValid, parseISO } from 'date-fns'

export const dateValue = (date: Date | undefined, end = false, time?: string) => {
  if (!date) return ''

  const clock = time || (end ? '23:59' : '00:00')
  // Giờ kết thúc 23:59 lấy hết 59 giây cuối, nếu không đơn tạo lúc 23:59:30 bị báo voucher hết hạn
  const seconds = end && clock === '23:59' ? '59' : '00'

  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}T${clock}:${seconds}+07:00`
}

export const composeDateTime = (date: string | null, time: string, end = false) =>
  date ? dateValue(new Date(date), end, time) : ''

export const toNullableNumber = (value: number | string | null | undefined) =>
  value === '' || value === null || value === undefined || Number.isNaN(Number(value)) ? null : Number(value)

export const timeValue = (value: string, fallback: string) => {
  return formatTime(value, 'HH:mm') || fallback
}

export const displayDateTime = (value: string | null) => {
  if (!value) return '-'
  return formatDateTime(value, 'dd/MM/yyyy HH:mm') || '-'
}

export const displayDate = (value: string | null) => {
  if (!value) return '-'
  const date = parseISO(value)
  return isValid(date)
    ? `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`
    : '-'
}

export const displayValidityPeriod = (startAt: string, endAt: string | null, unlimited: string) =>
  `${displayDateTime(startAt)} - ${endAt ? displayDateTime(endAt) : unlimited}`

export const isUnlimitedAmount = (value: number | null | undefined): value is null | undefined | 0 => !value

export const formatMoney = (value: number | null | undefined, currency: string) =>
  value == null ? '—' : `${new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 0 }).format(value)} ${currency}`
