import {
  FileArchiveIcon,
  FileAudioIcon,
  FileCodeIcon,
  FileIcon as FileGenericIcon,
  FileImageIcon,
  FileTextIcon,
  FileVideoIcon,
  SheetIcon
} from 'lucide-react'

interface FileIconProps {
  mimeType: string
  className?: string
}

export default function FileIcon({ mimeType, className }: FileIconProps) {
  if (mimeType.startsWith('image/')) {
    return <FileImageIcon className={className} />
  }

  if (mimeType.startsWith('video/')) {
    return <FileVideoIcon className={className} />
  }

  if (mimeType.startsWith('audio/')) {
    return <FileAudioIcon className={className} />
  }

  if (
    mimeType === 'application/pdf' ||
    mimeType === 'application/msword' ||
    mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ) {
    return <FileTextIcon className={className} />
  }

  if (
    mimeType === 'application/vnd.ms-excel' ||
    mimeType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
    mimeType === 'text/csv'
  ) {
    return <SheetIcon className={className} />
  }

  if (
    mimeType === 'application/zip' ||
    mimeType === 'application/x-rar-compressed' ||
    mimeType === 'application/x-7z-compressed'
  ) {
    return <FileArchiveIcon className={className} />
  }

  if (
    mimeType === 'text/html' ||
    mimeType === 'text/css' ||
    mimeType === 'text/javascript' ||
    mimeType === 'application/json'
  ) {
    return <FileCodeIcon className={className} />
  }

  return <FileGenericIcon className={className} />
}
