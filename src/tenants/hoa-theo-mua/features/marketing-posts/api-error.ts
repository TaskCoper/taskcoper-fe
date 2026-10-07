import type { ErrorResponse } from '@/lib/axios'
import type { AxiosError } from 'axios'

// Backend trả lỗi theo hai kiểu: envelope riêng có `detail` cùng `errors` dạng mảng {field, message},
// và lỗi model binding của ASP.NET với `errors` dạng object gom theo field. Lỗi validation thì
// `detail` rỗng, nên phải mò xuống `errors` mới có chữ để hiện cho người dùng.
export const getApiErrorDetail = (error: AxiosError<ErrorResponse>) => {
  const data = error.response?.data

  if (!data) return undefined
  if (data.detail) return data.detail

  const { errors } = data

  if (Array.isArray(errors)) {
    const [first] = errors

    return typeof first?.message === 'string' ? first.message : undefined
  }

  if (errors && typeof errors === 'object') {
    const [messages] = Object.values(errors as Record<string, unknown>)

    return Array.isArray(messages) && typeof messages[0] === 'string' ? messages[0] : undefined
  }

  return undefined
}
