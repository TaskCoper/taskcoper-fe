import { isValid, parseISO } from 'date-fns'

export const dateValue = (date: Date | undefined, end = false) =>
  date
    ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}T${end ? '23:59:59' : '00:00:00'}+07:00`
    : ''

export const displayDate = (value: string) => {
  const date = parseISO(value)
  return isValid(date)
    ? `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`
    : '-'
}
