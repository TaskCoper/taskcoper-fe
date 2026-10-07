import { isValid, parseISO } from 'date-fns'
import { formatDateTime, formatTime } from '@/lib/date'

export const dateValue = (date: Date | undefined, end = false, time?: string) =>
  date
    ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}T${time ? `${time}:00` : end ? '23:59:59' : '00:00:00'}+07:00`
    : ''

export const timeValue = (value: string, fallback: string) => {
  return formatTime(value, 'HH:mm') || fallback
}

export const displayDateTime = (value: string) => {
  return formatDateTime(value, 'dd/MM/yyyy HH:mm') || '-'
}

export const displayDate = (value: string) => {
  const date = parseISO(value)
  return isValid(date)
    ? `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`
    : '-'
}

export const formatMoney = (value: number | null | undefined, currency: string) =>
  value == null ? '—' : `${new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 0 }).format(value)} ${currency}`
