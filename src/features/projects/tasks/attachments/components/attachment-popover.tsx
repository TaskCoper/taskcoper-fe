import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Spinner } from '@/components/ui/spinner'
import { XIcon } from 'lucide-react'
import { useEffect } from 'react'
import { FormProvider, type SubmitHandler } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useUploadTaskAttachment } from '../hooks/use-upload-task-attachment'
import type { UploadTaskAttachmentFormValues } from '../validations'
import UploadAttachmentForm from './upload-attachment-form'

interface AttachmentPopoverProps {
  children: React.ReactNode
  taskId: string
  projectIdentifier: string
  parentMilestoneIdentifier: string
  disabled?: boolean
}

export default function AttachmentPopover({
  children,
  taskId,
  projectIdentifier,
  parentMilestoneIdentifier,
  disabled = false
}: AttachmentPopoverProps) {
  const { t } = useTranslation()
  const { methods, uploadTaskAttachment, isUploadingTaskAttachment, open, setOpen, recalculatePosition } =
    useUploadTaskAttachment({
      taskId,
      projectIdentifier,
      parentMilestoneIdentifier
    })

  const onSubmit: SubmitHandler<UploadTaskAttachmentFormValues> = (body) => {
    recalculatePosition()
    const updatedBody = {
      ...body,
      position: methods.getValues('position')
    }

    uploadTaskAttachment({ body: updatedBody })
  }

  const onClose = () => {
    setOpen(false)
    methods.reset()
  }

  useEffect(() => {
    if (taskId && open) {
      methods.reset({
        taskId,
        commentId: null,
        bytes: null,
        position: 0,
        isUpload: false,
        mimeType: null,
        storageKey: null,
        name: '',
        url: ''
      })
    }
  }, [taskId, methods, open])

  return (
    <Popover
      modal
      open={open}
      onOpenChange={(open) => {
        if (!open) {
          methods.reset()
        }
        setOpen(open)
      }}
    >
      <PopoverTrigger asChild disabled={disabled}>
        {children}
      </PopoverTrigger>
      <PopoverContent
        align='start'
        className='p-0 min-w-80 max-h-[calc(var(--radix-popover-content-available-height)-8px)] overflow-y-auto'
        sideOffset={8}
        onInteractOutside={onClose}
      >
        <div className='p-4 flex flex-col gap-4'>
          <div className='flex items-center justify-center relative'>
            <p className='text-sm font-bold w-full text-center text-foreground/80'>{t('task.attachment.attachment')}</p>
            <XIcon className='size-4 absolute right-0 cursor-pointer' onClick={onClose} />
          </div>

          <FormProvider {...methods}>
            <form className='flex flex-col' onSubmit={methods.handleSubmit(onSubmit)}>
              <UploadAttachmentForm
                taskId={taskId}
                projectIdentifier={projectIdentifier}
                parentMilestoneIdentifier={parentMilestoneIdentifier}
                onUploadComplete={onClose}
              />

              <div className='space-x-2 ml-auto'>
                <Button type='button' variant='secondary' disabled={isUploadingTaskAttachment} onClick={onClose}>
                  {t('common.button.cancel')}
                </Button>

                <Button disabled={isUploadingTaskAttachment}>
                  {isUploadingTaskAttachment ? <Spinner /> : null}
                  {t('common.button.insert')}
                </Button>
              </div>
            </form>
          </FormProvider>
        </div>
      </PopoverContent>
    </Popover>
  )
}
