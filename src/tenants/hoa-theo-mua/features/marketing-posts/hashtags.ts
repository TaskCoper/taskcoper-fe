// Người dùng phải tự gõ dấu '#'. Trước đây hệ thống tự thêm hộ, nhưng như vậy thì gõ một câu
// bình thường cũng biến thành một đống hashtag mà không ai nhận ra - giờ cái gì có '#' mới tính.
const HASHTAG_SEPARATOR = /[\s,]+/

export const splitHashtagTokens = (value: string) => value.split(HASHTAG_SEPARATOR).filter(Boolean)

export const isHashtagToken = (token: string) => token.startsWith('#') && token.length > 1

export const parseHashtags = (value: string) => [...new Set(splitHashtagTokens(value).filter(isHashtagToken))]

// Chữ gõ vào mà thiếu '#' thì không thành hashtag. Trả về để vừa tô màu cảnh báo trong ô nhập,
// vừa chặn ở bước submit, khỏi lặng lẽ nuốt mất.
export const getInvalidHashtagTokens = (value: string) =>
  splitHashtagTokens(value).filter((token) => !isHashtagToken(token))
