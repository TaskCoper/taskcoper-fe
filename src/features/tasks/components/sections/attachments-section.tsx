import { Button } from '@/components/ui/button'
import AttachmentPopover from '@/features/attachments/components/attachment-popover'
import FileAttachment from '@/features/attachments/components/file-attachment'
import LinkAttachment from '@/features/attachments/components/link-attachment'
import { useGetMyProjectPermissions } from '@/features/projects/hooks/use-get-my-project-permissions'
import type { Attachment } from '@/types/attachment.type'
import { PaperclipIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'

interface AttachmentsSectionProps {
  taskId: string
  projectIdentifier: string
  parentMilestoneIdentifier: string
  attachments: Attachment[]
}

export default function AttachmentsSection({
  taskId,
  projectIdentifier,
  parentMilestoneIdentifier,
  attachments
}: AttachmentsSectionProps) {
  const { t } = useTranslation()

  const { check } = useGetMyProjectPermissions({ projectIdentifier })
  const canWrite = check('TASKS', 'canWrite')

  const fileAttachments = attachments.filter((attachment) => attachment.isUpload)
  const linkAttachments = attachments.filter((attachment) => !attachment.isUpload)

  return (
    <div className='mt-10'>
      <div className='flex gap-3'>
        <PaperclipIcon className='mt-1.5 size-4' />
        <div className='flex items-center justify-between w-full'>
          <p className='font-semibold'>{t('task.attachment.attachmentsSection')}</p>

          {canWrite ? (
            <AttachmentPopover
              taskId={taskId}
              projectIdentifier={projectIdentifier}
              parentMilestoneIdentifier={parentMilestoneIdentifier}
            >
              <Button variant='secondary' size='sm'>
                {t('common.button.add')}
              </Button>
            </AttachmentPopover>
          ) : null}
        </div>
      </div>

      <div className='pl-7 mt-2 space-y-6'>
        {linkAttachments.length > 0 ? (
          <div className='space-y-2'>
            <p className='font-semibold text-sm'>{t('task.attachment.links')}</p>

            <div className='space-y-1'>
              {linkAttachments.map((attachment) => (
                <LinkAttachment
                  key={attachment.projectResourceId}
                  attachment={attachment}
                  taskId={taskId}
                  parentMilestoneIdentifier={parentMilestoneIdentifier}
                  projectIdentifier={projectIdentifier}
                />
              ))}
            </div>
          </div>
        ) : null}

        {fileAttachments.length > 0 ? (
          <div className='space-y-2'>
            <p className='font-semibold text-sm'>{t('task.attachment.files')}</p>

            {fileAttachments.map((attachment) => (
              <FileAttachment
                key={attachment.projectResourceId}
                attachment={attachment}
                taskId={taskId}
                parentMilestoneIdentifier={parentMilestoneIdentifier}
                projectIdentifier={projectIdentifier}
              />
            ))}
          </div>
        ) : null}
      </div>
    </div>
  )
}
