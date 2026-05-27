import type { I18nKey } from '@/lib/i18n/types'
import i18next from 'i18next'

export const formatBytes = (bytes: number): string => {
  if (bytes === 0) return i18next.t('common.unit.fileSize.zeroBytes')
  const k = 1024
  const sizes: I18nKey[] = [
    'common.unit.fileSize.bytes',
    'common.unit.fileSize.kb',
    'common.unit.fileSize.mb',
    'common.unit.fileSize.gb',
    'common.unit.fileSize.tb'
  ]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${i18next.t(sizes[i])}`
}

/**
 * Formats a MIME type string into a human-readable label for UI display
 */
export const formatMimeType = (mimeType: string): string => {
  if (!mimeType) return i18next.t('mimeTypes.unknownFile')

  const mimeMap: Record<string, string> = {
    // Images
    'image/jpeg': i18next.t('mimeTypes.image.jpeg'),
    'image/png': i18next.t('mimeTypes.image.png'),
    'image/gif': i18next.t('mimeTypes.image.gif'),
    'image/svg+xml': i18next.t('mimeTypes.image.svg'),
    'image/webp': i18next.t('mimeTypes.image.webp'),

    // Documents
    'application/pdf': i18next.t('mimeTypes.document.pdf'),
    'application/msword': i18next.t('mimeTypes.document.word'),
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': i18next.t('mimeTypes.document.wordDocx'),
    'application/vnd.ms-excel': i18next.t('mimeTypes.document.excel'),
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': i18next.t('mimeTypes.document.excelXlsx'),
    'application/vnd.ms-powerpoint': i18next.t('mimeTypes.document.powerpoint'),
    'application/vnd.openxmlformats-officedocument.presentationml.presentation': i18next.t(
      'mimeTypes.document.powerpointPptx'
    ),
    'text/plain': i18next.t('mimeTypes.document.text'),
    'text/csv': i18next.t('mimeTypes.document.csv'),

    // Archives
    'application/zip': i18next.t('mimeTypes.archive.zip'),
    'application/x-7z-compressed': i18next.t('mimeTypes.archive.sevenZip'),
    'application/x-rar-compressed': i18next.t('mimeTypes.archive.rar'),

    // Media
    'video/mp4': i18next.t('mimeTypes.media.video.mp4'),
    'audio/mpeg': i18next.t('mimeTypes.media.audio.mp3'),
    'audio/wav': i18next.t('mimeTypes.media.audio.wav')
  }

  if (mimeMap[mimeType]) {
    return mimeMap[mimeType]
  }

  const [category] = mimeType.split('/')

  if (category === 'image') return i18next.t('mimeTypes.image.generic')
  if (category === 'video') return i18next.t('mimeTypes.media.video.generic')
  if (category === 'audio') return i18next.t('mimeTypes.media.audio.generic')
  if (category === 'text') return i18next.t('mimeTypes.generic.text')

  return i18next.t('mimeTypes.generic.file')
}
