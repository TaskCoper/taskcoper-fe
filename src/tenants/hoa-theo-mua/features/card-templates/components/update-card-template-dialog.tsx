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
import { Spinner } from '@/components/ui/spinner'
import { Textarea } from '@/components/ui/textarea'
import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { cn } from '@/shared/utils'
import { zodResolver } from '@hookform/resolvers/zod'
import { ImageIcon, UploadCloudIcon } from 'lucide-react'
import { useEffect } from 'react'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { useUpdateCardTemplate } from '../hooks/use-update-card-template'
import type { CardTemplateListItem } from '../types'
import {
  CARD_TEMPLATE_DESCRIPTION_MAX_LENGTH,
  CARD_TEMPLATE_IMAGE_MAX_SIZE,
  CARD_TEMPLATE_NAME_MAX_WORDS,
  updateCardTemplateSchema,
  type UpdateCardTemplateFormValues
} from '../validations'

const countWords = (value: string) => value.trim().split(/\s+/u).filter(Boolean).length

const UpdateCardTemplateDialog = ({
  template,
  open,
  onOpenChange
}: {
  template: CardTemplateListItem | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) => {
  const { t } = useTenantTranslation()
  const { updateCardTemplate, isUpdatingCardTemplate } = useUpdateCardTemplate()
  const methods = useForm<UpdateCardTemplateFormValues>({
    resolver: zodResolver(updateCardTemplateSchema(t)),
    defaultValues: {
      name: '',
      description: '',
      imageFile: null
    }
  })
  const { reset } = methods
  const name = useWatch({ control: methods.control, name: 'name' })
  const description = useWatch({ control: methods.control, name: 'description' })

  useEffect(() => {
    if (!open || !template) return

    reset({
      name: template.name,
      description: template.description ?? '',
      imageFile: null
    })
  }, [open, reset, template])

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) methods.reset()
    onOpenChange(nextOpen)
  }

  const handleSubmit = (values: UpdateCardTemplateFormValues) => {
    if (!template) return

    updateCardTemplate(
      {
        id: template.id,
        name: values.name.trim(),
        description: values.description.trim() || null,
        imageFile: values.imageFile
      },
      {
        onSuccess: () => handleOpenChange(false)
      }
    )
  }

  if (!template) return null

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className='sm:max-w-xl'>
        <DialogHeader>
          <DialogTitle>{t('cardTemplates.form.updateTitle')}</DialogTitle>
          <DialogDescription>{t('cardTemplates.form.updateDescription')}</DialogDescription>
        </DialogHeader>

        <form onSubmit={methods.handleSubmit(handleSubmit)} className='space-y-4' noValidate>
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
                    {countWords(name)}/{CARD_TEMPLATE_NAME_MAX_WORDS} {t('cardTemplates.form.words')}
                  </span>
                </div>
                <Input
                  {...field}
                  id={field.name}
                  placeholder={t('cardTemplates.form.namePlaceholder')}
                  aria-invalid={fieldState.invalid}
                  disabled={isUpdatingCardTemplate}
                  autoFocus
                />
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
                  disabled={isUpdatingCardTemplate}
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
                <FieldLabel>{t('cardTemplates.form.image')}</FieldLabel>
                <FileDropzone
                  value={field.value ?? template.imageUrl}
                  onFileChange={(file) => field.onChange(file)}
                  accept={{
                    'image/png': ['.png'],
                    'image/jpeg': ['.jpg', '.jpeg']
                  }}
                  maxSize={CARD_TEMPLATE_IMAGE_MAX_SIZE}
                  disabled={isUpdatingCardTemplate}
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
                          <p className='text-sm font-medium'>{t('cardTemplates.form.dropzoneTitle')}</p>
                        </div>
                      )}
                    </div>
                  )}
                </FileDropzone>
                <FieldDescription className='text-xs'>{t('cardTemplates.form.updateImageHint')}</FieldDescription>
                <div className='min-h-5'>
                  {fieldState.invalid && <FieldError className='text-xs' errors={[fieldState.error]} />}
                </div>
              </Field>
            )}
          />

          <DialogFooter>
            <Button
              type='button'
              variant='outline'
              disabled={isUpdatingCardTemplate}
              onClick={() => handleOpenChange(false)}
            >
              {t('common.button.cancel')}
            </Button>
            <Button type='submit' disabled={isUpdatingCardTemplate}>
              {isUpdatingCardTemplate && <Spinner />}
              {t('cardTemplates.form.updateSubmit')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default UpdateCardTemplateDialog
