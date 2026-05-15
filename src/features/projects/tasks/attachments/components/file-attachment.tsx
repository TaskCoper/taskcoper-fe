import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { format } from 'date-fns'
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

function getFileExtension(filename: string): string {
  const parts = filename.split('.')
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
  const isImage = isImageMimeType(attachment.mimeType)
  const extension = getFileExtension(attachment.name)

  const handleThumbnailClick = () => {
    window.open(attachment.url, '_blank')
  }

  return (
    <>
      <div className='flex items-center gap-3 pr-1.5'>
        {isImage ? (
          <img
            src={attachment.url}
            alt={attachment.name}
            className='w-16 h-12 rounded-md object-cover cursor-pointer hover:opacity-80 transition-opacity'
            onClick={handleThumbnailClick}
          />
        ) : (
          <Card
            className='bg-muted w-16 h-12 p-0 rounded-md flex justify-center items-center cursor-pointer hover:bg-muted/80 transition-colors'
            onClick={handleThumbnailClick}
          >
            <p className='font-bold text-sm'>{extension}</p>
          </Card>
        )}

        <div className='flex-1 min-w-0'>
          <p className='font-medium text-sm line-clamp-2 truncate'>{attachment.name}</p>
          <p className='text-xs text-muted-foreground truncate'>
            {t('task.attachment.addedAt', { date: format(new Date(attachment.createdAt), 'HH:mm dd/MM/yyyy') })}
          </p>
        </div>

        <AttachmentMenu
          attachment={attachment}
          taskId={taskId}
          parentMilestoneIdentifier={parentMilestoneIdentifier}
          projectIdentifier={projectIdentifier}
        >
          <Button size='icon-sm' variant='secondary' className='size-6'>
            <MoreHorizontalIcon className='size-3' />
          </Button>
        </AttachmentMenu>
      </div>
    </>
  )
}
