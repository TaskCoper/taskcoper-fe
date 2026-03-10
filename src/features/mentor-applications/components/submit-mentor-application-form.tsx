import FileDropzone from '@/components/file-dropzone'
import RichTextEditor from '@/components/rich-text-editor'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { InputGroup, InputGroupAddon, InputGroupText, InputGroupTextarea } from '@/components/ui/input-group'
import { cn } from '@/shared/utils'
import { CheckIcon, FileTypeIcon, Loader2Icon, UploadCloudIcon, XIcon } from 'lucide-react'
import { Controller, useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import type { FileUploadStatus } from '../hooks/use-submit-mentor-application'
import { type SubmitMentorApplicationFormValues } from '../validations'

interface SubmitMentorApplicationFormProps {
  uploadStatuses?: Record<number, FileUploadStatus>
  onClearStatuses?: () => void
}

export default function SubmitMentorApplicationForm({
  uploadStatuses,
  onClearStatuses
}: SubmitMentorApplicationFormProps) {
  const { t } = useTranslation()
  const {
    control,
    formState: { isSubmitting }
  } = useFormContext<SubmitMentorApplicationFormValues>()

  return (
    <div className='space-y-2'>
      <Controller
        name='shortBio'
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid} className='gap-1'>
            <FieldLabel htmlFor={field.name}>{t('mentorApplication.form.shortBio')}</FieldLabel>
            <InputGroup>
              <InputGroupTextarea
                {...field}
                id={field.name}
                placeholder={t('mentorApplication.form.shortBioPlaceholder')}
                rows={6}
                className='min-h-24 resize-none wrap-break-word'
                aria-invalid={fieldState.invalid}
              />
              <InputGroupAddon align='block-end'>
                <InputGroupText className='tabular-nums text-xs'>
                  {field.value.length}/255 {t('common.ui.characters')}
                </InputGroupText>
              </InputGroupAddon>
            </InputGroup>
          </Field>
        )}
      />

      <Controller
        name='description'
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid} className='gap-1 mt-4'>
            <FieldLabel htmlFor={field.name}>{t('mentorApplication.form.detailedIntroduction')}</FieldLabel>

            <RichTextEditor
              isInitialFocus={false}
              content={field.value ?? ''}
              onChange={field.onChange}
              compact
              invalid={fieldState.invalid}
              error={fieldState.error}
              placeholder={t('mentorApplication.form.detailedIntroductionPlaceholder')}
            />
          </Field>
        )}
      />

      <Controller
        name='portfolioFiles'
        control={control}
        render={({ field, fieldState }) => {
          const files: File[] = field.value ?? []

          const removeFile = (index: number) => {
            field.onChange(files.filter((_, i) => i !== index))
          }

          return (
            <Field data-invalid={fieldState.invalid} className='gap-1'>
              <FieldLabel>{t('mentorApplication.form.portfolioFiles')}</FieldLabel>
              <FileDropzone
                multiple
                accept={{
                  'application/pdf': ['.pdf'],
                  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
                }}
                onFilesChange={(newFiles) => {
                  onClearStatuses?.()
                  field.onChange([...files, ...newFiles])
                }}
              >
                {({ isDragActive }) => (
                  <div
                    className={cn(
                      'rounded-lg border border-border border-dashed p-4 transition-colors',
                      isDragActive
                        ? 'border-primary bg-primary/5'
                        : fieldState.invalid
                          ? 'border-destructive bg-destructive/5'
                          : 'border-muted-foreground/30 hover:border-muted-foreground/50 hover:bg-muted/40'
                    )}
                  >
                    {files.length === 0 ? (
                      <div className='flex flex-col items-center justify-center gap-2 py-6 text-center'>
                        <UploadCloudIcon
                          className={cn('size-8', isDragActive ? 'text-primary' : 'text-muted-foreground')}
                        />
                        <div className='space-y-1'>
                          <p className='text-sm font-medium'>
                            {isDragActive
                              ? t('mentorApplication.form.dropzoneActive')
                              : t('mentorApplication.form.dropzoneEmpty')}
                          </p>
                          <p className='text-muted-foreground text-xs'>{t('mentorApplication.form.dropzoneHint')}</p>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className='grid grid-cols-2 gap-2 sm:grid-cols-4'>
                          {files.map((file, index) => {
                            const isPdf = file.name.toLowerCase().endsWith('.pdf')
                            const status = uploadStatuses?.[index]

                            return (
                              <div
                                key={`${file.name}-${index}`}
                                className={cn(
                                  'bg-background relative flex flex-col items-center gap-1.5 rounded-md border p-3 text-center transition-all',
                                  status === 'uploading' && 'opacity-60',
                                  status === 'success' && 'border-green-500/50 bg-green-500/5',
                                  status === 'error' && 'border-destructive/50 bg-destructive/5'
                                )}
                              >
                                {status === 'uploading' ? (
                                  <p className='absolute -right-1.5 -top-1.5 rounded-full bg-muted p-0.5 shadow-sm'>
                                    <Loader2Icon className='size-3 animate-spin text-muted-foreground' />
                                  </p>
                                ) : status === 'success' ? (
                                  <p className='absolute -right-1.5 -top-1.5 rounded-full bg-green-500 p-0.5 shadow-sm'>
                                    <CheckIcon className='size-3 text-white' />
                                  </p>
                                ) : (
                                  <button
                                    type='button'
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      removeFile(index)
                                    }}
                                    disabled={isSubmitting}
                                    className={cn(
                                      'cursor-pointer absolute -right-1.5 -top-1.5 rounded-full p-0.5 shadow-sm transition-opacity hover:opacity-80',
                                      status === 'error' ? 'bg-destructive' : 'bg-destructive'
                                    )}
                                    aria-label={t('mentorApplication.form.removeFile', { name: file.name })}
                                  >
                                    <XIcon className='size-3 text-white' />
                                  </button>
                                )}

                                <FileTypeIcon className={cn('size-8', isPdf ? 'text-red-500' : 'text-blue-500')} />
                                <p className='w-full truncate text-xs font-medium'>{file.name}</p>
                                <p className='text-muted-foreground text-xs'>{(file.size / 1024).toFixed(0)} KB</p>

                                {status === 'uploading' && (
                                  <p className='text-muted-foreground text-xs'>
                                    {t('mentorApplication.form.statusUploading')}
                                  </p>
                                )}
                                {status === 'success' && (
                                  <p className='text-xs text-green-600'>{t('mentorApplication.form.statusUploaded')}</p>
                                )}
                                {status === 'error' && (
                                  <p className='text-destructive text-xs'>{t('mentorApplication.form.statusFailed')}</p>
                                )}
                              </div>
                            )
                          })}
                        </div>

                        {!isSubmitting && (
                          <p className='text-muted-foreground mt-3 text-center text-xs'>
                            {isDragActive
                              ? t('mentorApplication.form.dropzoneAddMoreActive')
                              : t('mentorApplication.form.dropzoneAddMore')}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </FileDropzone>

              <div className='min-h-4'>
                {fieldState.invalid && <FieldError className='text-xs' errors={[fieldState.error]} />}
              </div>
            </Field>
          )
        }}
      />
    </div>
  )
}
