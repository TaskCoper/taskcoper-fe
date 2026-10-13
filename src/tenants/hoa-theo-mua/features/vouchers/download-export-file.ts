import type { VoucherExportFile } from './types'

export const downloadExportFile = ({ blob, fileName }: VoucherExportFile) => {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')

  anchor.href = url
  anchor.download = fileName
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  // Thu hồi URL ngay sau click có thể hủy lượt tải ở Safari/Firefox khi trình duyệt chưa kịp đọc blob
  setTimeout(() => URL.revokeObjectURL(url), 10_000)
}
