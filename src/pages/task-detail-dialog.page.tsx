import RichTextEditor from '@/components/rich-text-editor'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import AssigneePopover from '@/features/assignees/components/assignee-popover'
import AttachmentPopover from '@/features/attachments/components/attachment-popover'
import LabelPopover from '@/features/labels/components/label-popover'
import SubtaskPopover from '@/features/subtasks/components/subtask-popover'
import DatePopover from '@/features/tasks/components/date-popover'
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'
import {
  ChevronDownIcon,
  ClockIcon,
  EyeIcon,
  ImageIcon,
  MessageSquareText,
  MoreHorizontalIcon,
  PaperclipIcon,
  SquareCheckBigIcon,
  TagIcon,
  TextAlignStartIcon,
  UserRoundPlusIcon,
  XIcon
} from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router'

export default function TaskDetailDialogPage() {
  const { t } = useTranslation()
  const { projectId, milestoneId, taskId } = useParams<{ projectId: string; milestoneId: string; taskId: string }>()
  const navigate = useNavigate()

  const [isEditDescription, setIsEditDescription] = useState(false)
  const [open, setOpen] = useState(true)

  const handleClose = () => {
    setOpen(false)
    setTimeout(() => {
      navigate(`/projects/${projectId}/milestones/${milestoneId}`)
    }, 300)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        if (!open) {
          handleClose()
        }
        setOpen(open)
      }}
    >
      <DialogContent
        showCloseButton={false}
        position='top-center'
        className='min-w-6xl p-0 gap-0'
        onInteractOutside={handleClose}
      >
        <VisuallyHidden>
          <DialogHeader>
            <DialogTitle>Task Detail</DialogTitle>
            <DialogDescription>Task Description</DialogDescription>
          </DialogHeader>
        </VisuallyHidden>
        <div className='px-6 py-4 flex items-center justify-between gap-2'>
          <Button size='sm' variant='secondary'>
            {taskId}
            <ChevronDownIcon />
          </Button>

          <div className='flex items-center gap-1'>
            <Button className='rounded-full' variant='ghost' size='icon-sm'>
              <EyeIcon />
            </Button>

            <Separator orientation='vertical' />

            <Button className='rounded-full' variant='ghost' size='icon-sm'>
              <ImageIcon />
            </Button>

            <Button className='rounded-full' variant='ghost' size='icon-sm'>
              <MoreHorizontalIcon />
            </Button>

            <Button className='rounded-full' variant='ghost' size='icon-sm' onClick={handleClose}>
              <XIcon />
            </Button>
          </div>
        </div>
        <Separator />
        <div className='grid grid-cols-12'>
          <div className='col-span-7 p-6 border-r border-border'>
            <div className='flex gap-3'>
              <Checkbox className='rounded-full border-foreground mt-2' />
              <div className='space-y-6'>
                <p className='text-3xl font-bold'>Tags Or Done</p>

                {/* Action Buttons */}
                <div className='flex items-center gap-2 flex-wrap'>
                  <LabelPopover>
                    <Button variant='outline' size='sm'>
                      <TagIcon />
                      {t('common.field.label')}
                    </Button>
                  </LabelPopover>
                  <DatePopover>
                    <Button variant='outline' size='sm'>
                      <ClockIcon />
                      {t('common.field.date')}
                    </Button>
                  </DatePopover>
                  <SubtaskPopover>
                    <Button variant='outline' size='sm'>
                      <SquareCheckBigIcon />
                      {t('task.subtask.subtask')}
                    </Button>
                  </SubtaskPopover>
                  <AssigneePopover>
                    <Button variant='outline' size='sm'>
                      <UserRoundPlusIcon />
                      {t('task.assignee.assignee')}
                    </Button>
                  </AssigneePopover>
                  <AttachmentPopover>
                    <Button variant='outline' size='sm'>
                      <PaperclipIcon />
                      {t('task.attachment.attachment')}
                    </Button>
                  </AttachmentPopover>
                </div>
              </div>
            </div>

            <div className='flex gap-3 mt-10'>
              <TextAlignStartIcon className='mt-1 size-4' />
              <div className='w-full space-y-4'>
                <p className='font-semibold'>{t('common.field.description')}</p>

                {isEditDescription ? (
                  <RichTextEditor isDisplay={true} content='' onChange={() => {}} />
                ) : (
                  <Textarea
                    placeholder={t('task.description.addDescription')}
                    className='resize-none w-full font-semibold'
                    readOnly
                    onClick={() => setIsEditDescription(true)}
                  />
                )}
              </div>
            </div>
          </div>

          <div className='col-span-5 p-6 bg-muted'>
            <div className='flex items-center gap-2 mb-4'>
              <MessageSquareText className='size-4' />
              <p className='text-sm font-bold'>{t('task.comment.comment')}</p>
            </div>

            <Input
              placeholder={t('task.comment.addComment')}
              className='font-semibold bg-background'
              // value={comment}
              // onChange={(e) => setComment(e.target.value)}
              // onKeyDown={(e) => {
              //   if (e.key === 'Enter') {
              //     handleCreateCommment()
              //   }
              // }}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
