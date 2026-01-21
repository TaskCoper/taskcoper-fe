import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/shared/utils'
import type { Attachment } from '@/types/attachment.type'
import { ChevronLeftIcon, XIcon } from 'lucide-react'
import { useEffect, useState } from 'react'
import { FormProvider, type SubmitHandler } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useDeleteAttachment } from '../hooks/use-delete-attachment'
import { useUpdateAttachment } from '../hooks/use-update-attachment'
import type { UpdateAttachmentFormValues } from '../validations'
import FileAttachmentForm from './file-attachment-form'
import LinkAttachmentForm from './link-attachment-form'

interface AttachmentMenuProps {
  children: React.ReactNode
  attachment: Attachment
  taskId: string
  parentMilestoneId: string
  projectId: string
}

export default function AttachmentMenu({
  children,
  attachment,
  taskId,
  parentMilestoneId,
  projectId
}: AttachmentMenuProps) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

  const { methods, updateAttachment, isUpdatingAttachment } = useUpdateAttachment()
  const { deleteAttachment, isDeletingAttachment } = useDeleteAttachment({
    parentMilestoneId,
    projectId
  })

  const onSubmit: SubmitHandler<UpdateAttachmentFormValues> = (body) => {
    setIsEditing(false)
    updateAttachment({ body })
  }

  const onClose = () => {
    setIsDeleting(false)
    setIsEditing(false)
    setOpen(false)
  }

  useEffect(() => {
    if (isEditing) {
      if (attachment.isUpload) {
        methods.reset({
          isUpload: true, // file
          bytes: attachment.bytes,
          mimeType: attachment.mimeType,
          name: attachment.name,
          taskId,
          projectResourceId: attachment.projectResourceId,
          position: attachment.position,
          storageKey: attachment.storageKey,
          url: attachment.url
        })
      } else {
        methods.reset({
          isUpload: false, // link
          name: attachment.name,
          taskId,
          projectResourceId: attachment.projectResourceId,
          position: attachment.position,
          storageKey: attachment.storageKey,
          url: attachment.url,
          bytes: attachment.bytes,
          mimeType: attachment.mimeType
        })
      }
    }
  }, [isEditing, methods, attachment, taskId])

  console.log(methods.formState.errors)

  return (
    <Popover modal open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent
        className={cn('p-0', isDeleting || isEditing ? 'w-72' : 'w-52')}
        side='bottom'
        align='start'
        sideOffset={8}
        onInteractOutside={onClose}
      >
        {isEditing ? (
          <div className='p-3 space-y-2'>
            <div className='flex items-center justify-center relative mt-1'>
              <Button variant='ghost' size='icon-sm' onClick={() => setIsDeleting(false)} className='absolute left-0'>
                <ChevronLeftIcon />
              </Button>
              <p className='text-sm font-bold whitespace-nowrap'>{t('task.attachment.deleteAttachment.title')}</p>
              <Button variant='ghost' size='icon-sm' onClick={onClose} className='absolute right-0'>
                <XIcon />
              </Button>
            </div>

            <FormProvider {...methods}>
              <form onSubmit={methods.handleSubmit(onSubmit)}>
                {attachment.isUpload ? <FileAttachmentForm /> : <LinkAttachmentForm />}

                {attachment.isUpload ? (
                  <Button type='submit' className='w-full' disabled={isUpdatingAttachment}>
                    {t('common.button.save')}
                  </Button>
                ) : (
                  <div className='flex items-center justify-end gap-2'>
                    <Button
                      type='button'
                      variant='ghost'
                      onClick={() => setIsEditing(false)}
                      disabled={isUpdatingAttachment}
                    >
                      {t('common.button.cancel')}
                    </Button>
                    <Button type='submit' disabled={isUpdatingAttachment}>
                      {t('common.button.save')}
                    </Button>
                  </div>
                )}
              </form>
            </FormProvider>
          </div>
        ) : isDeleting ? (
          <div className='p-3 space-y-2'>
            <div className='flex items-center justify-center relative mt-1'>
              <Button variant='ghost' size='icon-sm' onClick={() => setIsDeleting(false)} className='absolute left-0'>
                <ChevronLeftIcon />
              </Button>
              <p className='text-sm font-bold whitespace-nowrap'>{t('task.attachment.deleteAttachment.title')}</p>
              <Button variant='ghost' size='icon-sm' onClick={onClose} className='absolute right-0'>
                <XIcon />
              </Button>
            </div>

            <p className='text-sm text-muted-foreground'>
              {t('task.attachment.deleteAttachment.description', { attachmentName: attachment.name })}
            </p>

            <Button
              className='w-full mt-2'
              variant='destructive'
              disabled={isDeletingAttachment}
              onClick={() => deleteAttachment({ id: attachment.projectResourceId, taskId })}
            >
              {t('task.attachment.deleteAttachment.confirmText')}
            </Button>
          </div>
        ) : (
          <div className='py-2'>
            <Button
              size='sm'
              className='w-full justify-start gap-2 rounded-none'
              variant='ghost'
              onClick={() => setIsEditing(true)}
            >
              <p>{t('common.button.edit')}</p>
            </Button>

            <Button
              size='sm'
              className='w-full justify-start gap-2 rounded-none'
              variant='ghost'
              onClick={() => setIsDeleting(true)}
            >
              <p className='text-destructive'>{t('common.button.delete')}</p>
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}
