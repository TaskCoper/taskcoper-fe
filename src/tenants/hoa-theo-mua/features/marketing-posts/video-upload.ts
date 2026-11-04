export const MARKETING_VIDEO_MAX_BYTES = 50 * 1024 * 1024

// Decode locally for an honest preview; publishing rechecks the actual file on the server.
export async function prepareMarketingVideo(file: File, signal: AbortSignal) {
  const header = new Uint8Array(await file.slice(0, 12).arrayBuffer())
  if (
    file.size > MARKETING_VIDEO_MAX_BYTES ||
    !file.name.toLowerCase().endsWith('.mp4') ||
    String.fromCharCode(...header.slice(4, 8)) !== 'ftyp'
  )
    throw new Error('invalidVideo')
  const url = URL.createObjectURL(file)
  const video = document.createElement('video')
  video.muted = true
  video.playsInline = true
  video.preload = 'auto'
  try {
    await new Promise<void>((resolve, reject) => {
      const cleanup = () => {
        clearTimeout(timer)
        signal.removeEventListener('abort', abort)
        video.onloadeddata = null
        video.onerror = null
      }
      const abort = () => {
        cleanup()
        reject(new DOMException('Aborted', 'AbortError'))
      }
      const timer = setTimeout(() => {
        cleanup()
        reject(new Error('invalidVideo'))
      }, 20_000)
      video.onloadeddata = () => {
        cleanup()
        resolve()
      }
      video.onerror = () => {
        cleanup()
        reject(new Error('invalidVideo'))
      }
      signal.addEventListener('abort', abort, { once: true })
      if (signal.aborted) return abort()
      video.src = url
    })
    if (!Number.isFinite(video.duration) || video.duration <= 0 || video.videoWidth < 1 || video.videoHeight < 1)
      throw new Error('invalidVideo')
    const canvas = document.createElement('canvas')
    const scale = Math.min(1, 1280 / Math.max(video.videoWidth, video.videoHeight))
    canvas.width = Math.round(video.videoWidth * scale)
    canvas.height = Math.round(video.videoHeight * scale)
    const context = canvas.getContext('2d')
    if (!context) throw new Error('invalidVideo')
    context.drawImage(video, 0, 0, canvas.width, canvas.height)
    const poster = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.8))
    if (!poster || poster.size > 1_000_000) throw new Error('invalidVideo')
    signal.throwIfAborted()
    return new File([poster], 'video-cover.jpg', { type: 'image/jpeg' })
  } finally {
    video.removeAttribute('src')
    video.load()
    URL.revokeObjectURL(url)
  }
}
