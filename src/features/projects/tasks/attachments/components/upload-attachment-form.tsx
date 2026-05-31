import FileDropzone from '@/components/file-dropzone'
import { Button } from '@/components/ui/button'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { useUploadFileWithToast } from '@/hooks/use-upload-file-with-toast'
import type { ErrorResponse } from '@/lib/axios'
import { MAX_ATTACHMENT_SIZE, POSITION_GAP } from '@/shared/constants'
import { prepareFileUpload } from '@/shared/utils'
import type { AxiosError } from 'axios'
import { useState } from 'react'
import { Controller, useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useUploadTaskAttachment } from '../hooks/use-upload-task-attachment'
import type { UploadTaskAttachmentFormValues } from '../validations'

interface UploadAttachmentFormProps {
  taskId: string
  projectIdentifier: string
  parentMilestoneIdentifier: string
  onUploadComplete?: () => void
}

export default function UploadAttachmentForm({
  taskId,
  projectIdentifier,
  parentMilestoneIdentifier,
  onUploadComplete
}: UploadAttachmentFormProps) {
  const { t } = useTranslation()
  const { control } = useFormContext<UploadTaskAttachmentFormValues>()
  const [isUploading, setIsUploading] = useState(false)

  const { uploadFileWithToast } = useUploadFileWithToast()
  const { uploadTaskAttachmentAsync, getNextPosition } = useUploadTaskAttachment({
    taskId,
    projectIdentifier,
    parentMilestoneIdentifier
  })

  const handleFilesChange = async (files: File[]) => {
    if (files.length === 0) return

    setIsUploading(true)
    let successCount = 0
    const totalFiles = files.length
    let currentPosition = getNextPosition()

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const { key, contentType } = prepareFileUpload(file)
      const url = await uploadFileWithToast({
        file,
        loadingDescription: `${file.name} - ${t('common.ui.pleaseWait')}`,
        successDescription: file.name,
        renderProgress: (progress) => (
          <div className='w-72 space-y-1'>
            <p className='text-xs font-medium truncate'>{file.name}</p>
            <Progress value={progress} className='w-full' />
            <p className='text-xs text-muted-foreground'>{progress}%</p>
          </div>
        ),
        onUploaded: async (uploadedUrl) => {
          await uploadTaskAttachmentAsync({
            body: {
              taskId,
              commentId: null,
              name: file.name,
              url: uploadedUrl,
              position: currentPosition,
              isUpload: true,
              storageKey: key,
              mimeType: contentType,
              bytes: file.size
            }
          })

          currentPosition += POSITION_GAP
          successCount++

          if (successCount === totalFiles) {
            onUploadComplete?.()
          }
        },
        errorDescription: (error) => (error as AxiosError<ErrorResponse>).response?.data?.detail || file.name
      })

      if (!url) continue
    }

    setIsUploading(false)
  }

  return (
    <div className='space-y-4'>
      <div className='space-y-2'>
        <p className='text-sm font-semibold text-foreground/60'>{t('task.attachment.attachmentTitle')}</p>
        <p className='text-xs text-muted-foreground'>{t('task.attachment.attachmentDescription')}</p>

        <FileDropzone
          onFilesChange={handleFilesChange}
          maxSize={MAX_ATTACHMENT_SIZE}
          disabled={isUploading}
          multiple
          className='w-full'
        >
          <Button type='button' variant='outline' className='w-full' disabled={isUploading}>
            {t('task.attachment.chooseAttachment')}
          </Button>
        </FileDropzone>
      </div>

      <Separator />

      <div>
        <Controller
          name='url'
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid} className='gap-1 w-full'>
              <FieldLabel htmlFor={field.name} className='gap-0.5'>
                {t('task.attachment.attachmentValue')}
                <span className='text-destructive font-semibold'>*</span>
              </FieldLabel>

              <Input
                {...field}
                id={field.name}
                aria-invalid={fieldState.invalid}
                placeholder={t('task.attachment.attachmentValuePlaceholder')}
                autoComplete='off'
                spellCheck={false}
              />
              <div className='min-h-4'>
                {fieldState.invalid && <FieldError className='text-xs' errors={[fieldState.error]} />}
              </div>
            </Field>
          )}
        />

        <Controller
          name='name'
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid} className='gap-1 w-full'>
              <FieldLabel htmlFor={field.name} className='gap-0.5'>
                {t('task.attachment.attachmentDisplay')}
                <span className='text-destructive font-semibold'>*</span>
              </FieldLabel>

              <Input
                {...field}
                id={field.name}
                aria-invalid={fieldState.invalid}
                placeholder={t('task.attachment.attachmentDisplayPlaceholder')}
                autoComplete='off'
                spellCheck={false}
              />
              <div className='min-h-4'>
                {fieldState.invalid && <FieldError className='text-xs' errors={[fieldState.error]} />}
              </div>
            </Field>
          )}
        />
      </div>
    </div>
  )
}
