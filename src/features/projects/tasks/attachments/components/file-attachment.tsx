import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useDateFormat } from '@/lib/date'
import { MoreHorizontalIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { Attachment } from '../types'
import AttachmentMenu from './attachment-menu'

interface FileAttachmentProps {
  attachment: Attachment
  taskId: string
  parentMilestoneIdentifier: string
  projectIdentifier: string
}

const mimeTypeExtensions: Record<string, string> = {
  'application/json': 'json',
  'application/msword': 'doc',
  'application/octet-stream': 'bin',
  'application/pdf': 'pdf',
  'application/vnd.ms-excel': 'xls',
  'application/vnd.ms-powerpoint': 'ppt',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'pptx',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
  'application/x-7z-compressed': '7z',
  'application/x-rar-compressed': 'rar',
  'application/zip': 'zip',
  'audio/mpeg': 'mp3',
  'audio/wav': 'wav',
  'image/jpeg': 'jpg',
  'image/svg+xml': 'svg',
  'text/csv': 'csv',
  'text/html': 'html',
  'text/javascript': 'js',
  'text/plain': 'txt'
}

function getFileExtension(mimeType: string, filename?: string): string {
  const normalizedMimeType = mimeType.split(';')[0]?.trim().toLowerCase()

  if (normalizedMimeType) {
    const mappedExtension = mimeTypeExtensions[normalizedMimeType]
    if (mappedExtension) {
      return mappedExtension.toUpperCase()
    }

    const subtype = normalizedMimeType.split('/')[1]
    if (subtype) {
      return subtype.replace(/^x-/, '').replace(/\+.*$/, '').toUpperCase()
    }
  }

  const parts = filename?.split('.') ?? []
  if (parts.length > 1) {
    return parts.pop()?.toUpperCase() ?? ''
  }

  return ''
}

function isImageMimeType(mimeType: string): boolean {
  return mimeType.startsWith('image/')
}

export default function FileAttachment({
  attachment,
  taskId,
  parentMilestoneIdentifier,
  projectIdentifier
}: FileAttachmentProps) {
  const { t } = useTranslation()
  const { formatDateTime } = useDateFormat()
  const isImage = isImageMimeType(attachment.mimeType)
  const extension = getFileExtension(attachment.mimeType, attachment.name)

  const handleThumbnailClick = () => {
    window.open(attachment.url, '_blank')
  }

  return (
    <>
      <div className='flex items-center gap-3 pr-1.5'>
        {isImage ? (
          <div className='w-16 h-12 rounded-xl overflow-hidden shrink-0 shadow-[0_1px_2px_rgba(0,0,0,0.5),inset_0_0_2px_rgba(0,0,0,0.15)]'>
            <img
              src={attachment.url}
              alt={attachment.name}
              className='w-full h-full object-cover cursor-pointer hover:opacity-80 transition-opacity'
              onClick={handleThumbnailClick}
            />
          </div>
        ) : (
          <Card
            className='bg-muted w-16 h-12 p-0 flex justify-center items-center cursor-pointer hover:bg-muted/80 transition-colors'
            onClick={handleThumbnailClick}
          >
            <p className='font-bold text-sm hover:underline'>{extension}</p>
          </Card>
        )}

        <div className='flex-1 min-w-0'>
          <p className='font-medium text-sm line-clamp-2 truncate'>{attachment.name}</p>
          <p className='text-xs text-muted-foreground truncate'>
            {t('task.attachment.addedAt', { date: formatDateTime(attachment.createdAt, 'dateTimeShort') })}
          </p>
        </div>

        <AttachmentMenu
          attachment={attachment}
          taskId={taskId}
          parentMilestoneIdentifier={parentMilestoneIdentifier}
          projectIdentifier={projectIdentifier}
        >
          <Button size='icon-sm' variant='outline' className='size-6'>
            <MoreHorizontalIcon className='size-3' />
          </Button>
        </AttachmentMenu>
      </div>
    </>
  )
}
