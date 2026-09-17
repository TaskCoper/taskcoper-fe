import FileDropzone from '@/components/file-dropzone'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Field, FieldDescription, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Spinner } from '@/components/ui/spinner'
import { Textarea } from '@/components/ui/textarea'
import { useUploadFileWithToast } from '@/hooks/use-upload-file-with-toast'
import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { cn } from '@/shared/utils'
import { ImageIcon, UploadCloudIcon } from 'lucide-react'
import { Controller, useWatch } from 'react-hook-form'
import { useCreateCardTemplate } from '../hooks/use-create-card-template'
import { CardTemplateType } from '../types'
import {
  CARD_TEMPLATE_DESCRIPTION_MAX_LENGTH,
  CARD_TEMPLATE_IMAGE_MAX_SIZE,
  CARD_TEMPLATE_NAME_MAX_LENGTH,
  type CreateCardTemplateFormValues
} from '../validations'

export default function CreateCardTemplateDialog({
  open,
  onOpenChange,
  onCreated
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreated: () => void
}) {
  const { t } = useTenantTranslation()
  const { createCardTemplate, isCreatingCardTemplate, methods } = useCreateCardTemplate()
  const { uploadFileWithToast, isUploading } = useUploadFileWithToast()
  const description = useWatch({ control: methods.control, name: 'description' })

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) methods.reset()
    onOpenChange(nextOpen)
  }

  const handleSubmit = async (values: CreateCardTemplateFormValues) => {
    const imageUrl = await uploadFileWithToast({ file: values.imageFile, showSuccessToast: false })
    if (!imageUrl) return

    createCardTemplate(
      {
        name: values.name,
        description: values.description || null,
        imageUrl,
        templateType: values.templateType
      },
      {
        onSuccess: () => {
          onCreated()
          handleOpenChange(false)
        }
      }
    )
  }

  const isSubmitting = isUploading || isCreatingCardTemplate

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent position='top-center' className='sm:max-w-xl'>
        <DialogHeader>
          <DialogTitle>{t('cardTemplates.form.title')}</DialogTitle>
          <DialogDescription>{t('cardTemplates.form.description')}</DialogDescription>
        </DialogHeader>

        <form onSubmit={methods.handleSubmit(handleSubmit)} className='space-y-1' noValidate>
          <Controller
            name='name'
            control={methods.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid} className='gap-1.5'>
                <div className='flex items-center justify-between gap-3'>
                  <FieldLabel htmlFor={field.name}>
                    {t('cardTemplates.form.name')}
                    <span className='text-destructive'>*</span>
                  </FieldLabel>
                  <span className='text-xs tabular-nums text-muted-foreground'>
                    {field.value.length}/{CARD_TEMPLATE_NAME_MAX_LENGTH}
                  </span>
                </div>
                <Input
                  {...field}
                  id={field.name}
                  placeholder={t('cardTemplates.form.namePlaceholder')}
                  aria-invalid={fieldState.invalid}
                  disabled={isSubmitting}
                  autoFocus
                />
                <div className='min-h-5'>
                  {fieldState.invalid && <FieldError className='text-xs' errors={[fieldState.error]} />}
                </div>
              </Field>
            )}
          />

          <Controller
            name='templateType'
            control={methods.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid} className='gap-1.5'>
                <FieldLabel htmlFor={field.name}>
                  {t('cardTemplates.column.type')}
                  <span className='text-destructive'>*</span>
                </FieldLabel>
                <Select value={field.value} onValueChange={field.onChange} disabled={isSubmitting}>
                  <SelectTrigger id={field.name} aria-invalid={fieldState.invalid} className='w-full'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={CardTemplateType.Handmade}>
                      {t(`cardTemplates.type.${CardTemplateType.Handmade}`)}
                    </SelectItem>
                    <SelectItem value={CardTemplateType.Ai}>
                      {t(`cardTemplates.type.${CardTemplateType.Ai}`)}
                    </SelectItem>
                  </SelectContent>
                </Select>
                <div className='min-h-5'>
                  {fieldState.invalid && <FieldError className='text-xs' errors={[fieldState.error]} />}
                </div>
              </Field>
            )}
          />

          <Controller
            name='description'
            control={methods.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid} className='gap-1.5'>
                <div className='flex items-center justify-between gap-3'>
                  <FieldLabel htmlFor={field.name}>{t('cardTemplates.form.templateDescription')}</FieldLabel>
                  <span className='text-xs tabular-nums text-muted-foreground'>
                    {description.length}/{CARD_TEMPLATE_DESCRIPTION_MAX_LENGTH}
                  </span>
                </div>
                <Textarea
                  {...field}
                  id={field.name}
                  rows={3}
                  placeholder={t('cardTemplates.form.descriptionPlaceholder')}
                  aria-invalid={fieldState.invalid}
                  className='resize-none whitespace-normal break-words'
                  disabled={isSubmitting}
                />
                <div className='min-h-5'>
                  {fieldState.invalid && <FieldError className='text-xs' errors={[fieldState.error]} />}
                </div>
              </Field>
            )}
          />

          <Controller
            name='imageFile'
            control={methods.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid} className='gap-1.5'>
                <FieldLabel>
                  {t('cardTemplates.form.image')}
                  <span className='text-destructive'>*</span>
                </FieldLabel>
                <FileDropzone
                  value={field.value ?? null}
                  onFileChange={(file) => field.onChange(file)}
                  accept={{
                    'image/png': ['.png'],
                    'image/jpeg': ['.jpg', '.jpeg']
                  }}
                  maxSize={CARD_TEMPLATE_IMAGE_MAX_SIZE}
                  disabled={isSubmitting}
                >
                  {({ preview, isDragActive }) => (
                    <div
                      className={cn(
                        'relative flex min-h-52 overflow-hidden rounded-xl border border-dashed transition-colors',
                        isDragActive
                          ? 'border-primary bg-primary/5'
                          : fieldState.invalid
                            ? 'border-destructive bg-destructive/5'
                            : 'border-muted-foreground/30 hover:border-muted-foreground/60 hover:bg-muted/30'
                      )}
                    >
                      {preview ? (
                        <img
                          src={preview}
                          alt={t('cardTemplates.form.imagePreviewAlt')}
                          className='max-h-72 w-full object-contain'
                        />
                      ) : (
                        <div className='flex w-full flex-col items-center justify-center gap-2 p-6 text-center'>
                          <span className='flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground'>
                            {isDragActive ? <ImageIcon /> : <UploadCloudIcon />}
                          </span>
                          <div>
                            <p className='text-sm font-medium'>
                              {isDragActive
                                ? t('cardTemplates.form.dropzoneActive')
                                : t('cardTemplates.form.dropzoneTitle')}
                            </p>
                            <p className='mt-1 text-xs text-muted-foreground'>{t('cardTemplates.form.dropzoneHint')}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </FileDropzone>
                <FieldDescription className='text-xs'>{t('cardTemplates.form.imageHint')}</FieldDescription>
                <div className='min-h-5'>
                  {fieldState.invalid && <FieldError className='text-xs' errors={[fieldState.error]} />}
                </div>
              </Field>
            )}
          />

          <DialogFooter>
            <Button type='button' variant='outline' disabled={isSubmitting} onClick={() => handleOpenChange(false)}>
              {t('common.button.cancel')}
            </Button>
            <Button type='submit' disabled={isSubmitting}>
              {isSubmitting && <Spinner />}
              {t('cardTemplates.form.submit')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
