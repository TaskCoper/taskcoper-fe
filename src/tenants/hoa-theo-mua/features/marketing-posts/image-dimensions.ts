// Backend nhận width/height của ảnh nguồn để sau này biết cắt ra được tỉ lệ nào.
// Đọc không được thì gửi null, backend cho phép bỏ trống.
export const readImageDimensions = (file: File) =>
  new Promise<{ width: number | null; height: number | null }>((resolve) => {
    const objectUrl = URL.createObjectURL(file)
    const image = new Image()

    const finish = (dimensions: { width: number | null; height: number | null }) => {
      URL.revokeObjectURL(objectUrl)
      resolve(dimensions)
    }

    image.onload = () => finish({ width: image.naturalWidth, height: image.naturalHeight })
    image.onerror = () => finish({ width: null, height: null })
    image.src = objectUrl
  })
