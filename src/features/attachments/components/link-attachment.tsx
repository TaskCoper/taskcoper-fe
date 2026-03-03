import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import type { Attachment } from '@/types/attachment.type'
import { LinkIcon, MoreHorizontalIcon } from 'lucide-react'
import { Link } from 'react-router'
import AttachmentMenu from './attachment-menu'

interface LinkAttachmentProps {
  attachment: Attachment
  taskId: string
  parentMilestoneId: string
  projectId: string
}

export default function LinkAttachment({ attachment, taskId, parentMilestoneId, projectId }: LinkAttachmentProps) {
  return (
    <Card className='flex-row items-center justify-between gap-3 pl-3 pr-1.5 py-1.5 rounded-md shadow-none'>
      <div className='flex items-center gap-2.5 min-w-0 overflow-hidden flex-1'>
        <LinkIcon className='size-3.5 shrink-0' />
        <Link to={attachment.url} target='_blank' className='text-primary underline truncate text-sm font-medium'>
          {attachment.name}
        </Link>
      </div>

      <AttachmentMenu
        attachment={attachment}
        taskId={taskId}
        parentMilestoneId={parentMilestoneId}
        projectId={projectId}
      >
        <Button size='icon-sm' variant='secondary' className='size-6'>
          <MoreHorizontalIcon className='size-3' />
        </Button>
      </AttachmentMenu>
    </Card>
  )
}
