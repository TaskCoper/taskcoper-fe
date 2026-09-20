import type { ImageViewport } from '@/lib/image-viewport'
import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Ảnh người dùng vừa chọn nhưng chưa upload, gom theo một key do editor tự đặt (uid của item,
 * field id của RHF, hoặc `uid:lang` khi mỗi ngôn ngữ có ảnh riêng).
 *
 * Viewport phải giữ tách khỏi ảnh vì file đang chờ chỉ có `blob:` URL, không mã hoá được viewport
 * vào trong URL như ảnh đã upload.
 */
export function usePendingImages() {
  const [files, setFiles] = useState<Record<string, File>>({})
  const [previews, setPreviews] = useState<Record<string, string>>({})
  const [viewports, setViewports] = useState<Record<string, ImageViewport | null>>({})

  const previewsRef = useRef(previews)
  useEffect(() => {
    previewsRef.current = previews
  }, [previews])

  // Thu hồi mọi blob: URL còn sót khi editor unmount.
  useEffect(() => () => Object.values(previewsRef.current).forEach((url) => URL.revokeObjectURL(url)), [])

  const stage = useCallback((key: string, file: File) => {
    setFiles((prev) => ({ ...prev, [key]: file }))
    // Ảnh mới thì reset viewport, không giữ khung của ảnh cũ.
    setViewports((prev) => ({ ...prev, [key]: null }))
    setPreviews((prev) => {
      if (prev[key]) URL.revokeObjectURL(prev[key])
      return { ...prev, [key]: URL.createObjectURL(file) }
    })
  }, [])

  const clear = useCallback((key: string | string[]) => {
    const keys = Array.isArray(key) ? key : [key]
    const drop = <T>(prev: Record<string, T>) => {
      const next = { ...prev }
      for (const k of keys) delete next[k]
      return next
    }
    setPreviews((prev) => {
      for (const k of keys) if (prev[k]) URL.revokeObjectURL(prev[k])
      return drop(prev)
    })
    setFiles(drop)
    setViewports(drop)
  }, [])

  const setViewport = useCallback((key: string, viewport: ImageViewport | null) => {
    setViewports((prev) => ({ ...prev, [key]: viewport }))
  }, [])

  const reset = useCallback(() => {
    setFiles({})
    setViewports({})
    setPreviews((prev) => {
      Object.values(prev).forEach((url) => URL.revokeObjectURL(url))
      return {}
    })
  }, [])

  return { files, previews, viewports, stage, clear, setViewport, reset }
}
