import FileDropzone from '@/components/file-dropzone'
import { Button } from '@/components/ui/button'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { useUploadFile } from '@/hooks/use-upload-file'
import type { ErrorResponse } from '@/lib/axios'
import { MAX_ATTACHMENT_SIZE, POSITION_GAP } from '@/shared/constants'
import { prepareFileUpload } from '@/shared/utils'
import type { AxiosError } from 'axios'
import { useState } from 'react'
import { Controller, useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { useUploadAttachment } from '../hooks/use-upload-attachment'
import { type UploadAttachmentFormValues } from '../validations'

interface UploadAttachmentFormProps {
  taskId: string
  projectId: string
  parentMilestoneId: string
  onUploadComplete?: () => void
}

export default function UploadAttachmentForm({
  taskId,
  projectId,
  parentMilestoneId,
  onUploadComplete
}: UploadAttachmentFormProps) {
  const { t } = useTranslation()
  const { control } = useFormContext<UploadAttachmentFormValues>()
  const [isUploading, setIsUploading] = useState(false)

  const { uploadFileAsync } = useUploadFile()
  const { uploadAttachmentAsync, getNextPosition } = useUploadAttachment({ taskId, projectId, parentMilestoneId })

  const handleFilesChange = async (files: File[]) => {
    if (files.length === 0) return

    setIsUploading(true)
    let successCount = 0
    const totalFiles = files.length
    let currentPosition = getNextPosition()

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const toastId = toast.loading(t('common.ui.uploading'), {
        description: `${file.name} - ${t('common.ui.pleaseWait')}`
      })

      try {
        const { key, contentType } = prepareFileUpload(file)
        const url = await uploadFileAsync({
          file,
          onProgress: (progress) => {
            toast.loading(t('common.ui.uploading'), {
              id: toastId,
              description: (
                <div className='w-full min-w-72 space-y-1'>
                  <p className='text-xs font-medium truncate'>{file.name}</p>
                  <Progress value={progress} className='w-full' />
                  <p className='text-xs text-muted-foreground'>{progress}%</p>
                </div>
              )
            })
          }
        })

        if (url) {
          await uploadAttachmentAsync({
            body: {
              taskId,
              commentId: null,
              name: file.name,
              url,
              position: currentPosition,
              isUpload: true,
              storageKey: key,
              mimeType: contentType,
              bytes: file.size
            }
          })

          currentPosition += POSITION_GAP

          toast.success(t('common.ui.uploadSuccess'), {
            id: toastId,
            description: file.name
          })
          successCount++

          if (successCount === totalFiles) {
            onUploadComplete?.()
          }
        } else {
          toast.error(t('error.somethingWentWrong'), {
            id: toastId,
            description: file.name
          })
        }
      } catch (error) {
        toast.error(t('error.somethingWentWrong'), {
          id: toastId,
          description: (error as AxiosError<ErrorResponse>).response?.data?.detail || file.name
        })
      }
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
          <Button type='button' variant='secondary' className='w-full' disabled={isUploading}>
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
              <FieldLabel htmlFor={field.name} className='gap-1 items-baseline'>
                {t('task.attachment.attachmentDisplay')}
                <span className='text-muted-foreground text-xs'>({t('common.ui.optional')})</span>
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
