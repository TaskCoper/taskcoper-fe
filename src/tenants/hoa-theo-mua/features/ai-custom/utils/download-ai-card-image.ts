const IMAGE_EXTENSION_BY_MIME_TYPE: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif'
}

const sanitizeFileName = (value: string) => value.replace(/[<>:"/\\|?*]/g, '-').trim()

export const downloadAiCardImage = async (imageUrl: string, fileName: string, contentType?: string) => {
  const normalizedUrl = imageUrl.trim()
  if (!normalizedUrl) throw new Error('Missing AI card output image')

  const response = await fetch(normalizedUrl)
  if (!response.ok) throw new Error(`Failed to fetch AI card output image: ${response.status}`)

  const imageBlob = await response.blob()
  const resolvedContentType = imageBlob.type || contentType || ''
  if (!imageBlob.size || !resolvedContentType.startsWith('image/')) {
    throw new Error('AI card output is not a valid image')
  }

  const extension = IMAGE_EXTENSION_BY_MIME_TYPE[resolvedContentType] ?? 'png'
  const normalizedFileName = sanitizeFileName(fileName) || `ai-card.${extension}`
  const objectUrl = URL.createObjectURL(imageBlob)
  const downloadLink = document.createElement('a')

  try {
    downloadLink.href = objectUrl
    downloadLink.download = normalizedFileName.includes('.') ? normalizedFileName : `${normalizedFileName}.${extension}`
    document.body.appendChild(downloadLink)
    downloadLink.click()
  } finally {
    downloadLink.remove()
    URL.revokeObjectURL(objectUrl)
  }
}
