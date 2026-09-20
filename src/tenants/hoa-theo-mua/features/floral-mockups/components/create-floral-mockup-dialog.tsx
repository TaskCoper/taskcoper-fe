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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useUploadFileWithToast } from '@/hooks/use-upload-file-with-toast'
import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { cn } from '@/shared/utils'
import { zodResolver } from '@hookform/resolvers/zod'
import { ImageIcon, InfoIcon, Trash2Icon, UploadCloudIcon } from 'lucide-react'
import { useMemo, useRef } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useCreateFloralMockup } from '../hooks/use-create-floral-mockup'
import {
  createFloralMockupSchema,
  FLORAL_MOCKUP_IMAGE_TYPES,
  MAX_FLORAL_MOCKUP_IMAGE_SIZE,
  type CreateFloralMockupFormValues
} from '../validations'
import { FlowerReferenceType } from '../types'

const defaultValues: CreateFloralMockupFormValues = {
  name: '',
  description: '',
  imageFile: null,
  type: FlowerReferenceType.Flower
}

export default function CreateFloralMockupDialog({
  open,
  onOpenChange,
  onCreated
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreated?: () => void
}) {
  const { t } = useTenantTranslation()
  const schema = useMemo(() => createFloralMockupSchema(t), [t])
  const { createFloralMockup, isCreatingFloralMockup } = useCreateFloralMockup()
  const { uploadFileWithToast, isUploading } = useUploadFileWithToast()
  const isSubmittingRef = useRef(false)
  const { control, handleSubmit, reset, setError, clearErrors } = useForm<CreateFloralMockupFormValues>({
    resolver: zodResolver(schema),
    defaultValues,
    mode: 'onChange'
  })

  const handleOpenChange = (nextOpen: boolean) => {
    if (isCreatingFloralMockup || isSubmittingRef.current) return
    if (!nextOpen) reset(defaultValues)
    onOpenChange(nextOpen)
  }

  const onSubmit = handleSubmit(async (values) => {
    if (isSubmittingRef.current || !values.imageFile) return

    isSubmittingRef.current = true
    try {
      const imageUrl = await uploadFileWithToast({ file: values.imageFile, showSuccessToast: false })
      if (!imageUrl) return

      await createFloralMockup({
        name: values.name,
        description: values.description || null,
        imageUrl,
        type: values.type,
        isActive: false
      })
      reset(defaultValues)
      onCreated?.()
      onOpenChange(false)
    } catch {
      // Mutation feedback is handled by the hook; keep the form open so the Admin can retry.
    } finally {
      isSubmittingRef.current = false
    }
  })

  const isSubmitting = isUploading || isCreatingFloralMockup

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className='w-[calc(100%-2rem)] min-w-0 overflow-x-hidden sm:max-w-2xl'>
        <DialogHeader>
          <DialogTitle>{t('floralMockups.form.title')}</DialogTitle>
          <DialogDescription>{t('floralMockups.form.description')}</DialogDescription>
        </DialogHeader>

        <form noValidate className='min-w-0 space-y-5' onSubmit={onSubmit}>
          <Controller
            name='name'
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid} className='min-w-0 gap-1.5'>
                <div className='flex items-center justify-between gap-3'>
                  <FieldLabel htmlFor={field.name}>
                    {t('floralMockups.form.name')}
                    <span className='text-destructive'>*</span>
                  </FieldLabel>
                  <span className='text-xs tabular-nums text-muted-foreground'>{field.value.length}/50</span>
                </div>
                <Input
                  {...field}
                  id={field.name}
                  aria-invalid={fieldState.invalid}
                  autoComplete='off'
                  autoFocus
                  placeholder={t('floralMockups.form.namePlaceholder')}
                  disabled={isSubmitting}
                />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          <Controller
            name='description'
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid} className='min-w-0 gap-1.5'>
                <div className='flex items-center justify-between gap-3'>
                  <FieldLabel htmlFor={field.name}>{t('floralMockups.form.mockupDescription')}</FieldLabel>
                  <span className='text-xs tabular-nums text-muted-foreground'>{field.value.length}/200</span>
                </div>
                <Textarea
                  {...field}
                  id={field.name}
                  aria-invalid={fieldState.invalid}
                  rows={3}
                  className='field-sizing-fixed min-w-0 max-w-full resize-none overflow-x-hidden break-all'
                  placeholder={t('floralMockups.form.descriptionPlaceholder')}
                  disabled={isSubmitting}
                />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          <Controller
            name='type'
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid} className='min-w-0 gap-1.5'>
                <FieldLabel htmlFor={field.name}>{t('floralMockups.column.type')}</FieldLabel>
                <Select value={field.value} onValueChange={field.onChange} disabled={isSubmitting}>
                  <SelectTrigger id={field.name} aria-invalid={fieldState.invalid} className='w-full'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={FlowerReferenceType.Flower}>{t('floralMockups.type.flower')}</SelectItem>
                    <SelectItem value={FlowerReferenceType.Bundle}>{t('floralMockups.type.bundle')}</SelectItem>
                  </SelectContent>
                </Select>
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          <Controller
            name='imageFile'
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid} className='min-w-0 gap-1.5'>
                <FieldLabel>
                  {t('floralMockups.form.image')}
                  <span className='text-destructive'>*</span>
                </FieldLabel>
                <FileDropzone
                  value={field.value}
                  accept={{ 'image/png': ['.png'], 'image/jpeg': ['.jpg', '.jpeg'] }}
                  maxSize={MAX_FLORAL_MOCKUP_IMAGE_SIZE}
                  disabled={isSubmitting}
                  onFileChange={(file) => {
                    field.onChange(file)
                    if (file) clearErrors('imageFile')
                  }}
                  onDropRejected={(rejections) => {
                    const rejectionCode = rejections[0]?.errors[0]?.code
                    setError('imageFile', {
                      type: 'manual',
                      message: t(
                        rejectionCode === 'file-too-large'
                          ? 'floralMockups.form.validation.imageSize'
                          : 'floralMockups.form.validation.imageType'
                      )
                    })
                  }}
                  className={cn(
                    'overflow-hidden rounded-xl border border-dashed bg-muted/20',
                    fieldState.invalid && 'border-destructive'
                  )}
                >
                  {({ preview, isDragActive }) =>
                    preview ? (
                      <div className='group relative flex min-h-52 items-center justify-center bg-muted/30 p-3'>
                        <img
                          src={preview}
                          alt={t('floralMockups.form.imagePreviewAlt')}
                          className='max-h-72 max-w-full rounded-lg object-contain'
                        />
                        <Button
                          type='button'
                          size='icon'
                          variant='destructive'
                          className='absolute top-3 right-3 opacity-0 shadow-md transition-opacity group-hover:opacity-100 focus-visible:opacity-100'
                          aria-label={t('floralMockups.form.removeImage')}
                          onClick={(event) => {
                            event.stopPropagation()
                            field.onChange(null)
                          }}
                        >
                          <Trash2Icon />
                        </Button>
                      </div>
                    ) : (
                      <div className='flex min-h-44 flex-col items-center justify-center gap-3 p-6 text-center'>
                        <span className='flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary'>
                          {isDragActive ? <UploadCloudIcon /> : <ImageIcon />}
                        </span>
                        <div className='space-y-1'>
                          <p className='text-sm font-medium'>
                            {t(isDragActive ? 'floralMockups.form.dropzoneActive' : 'floralMockups.form.dropzoneTitle')}
                          </p>
                          <p className='text-xs text-muted-foreground'>{t('floralMockups.form.imageHint')}</p>
                        </div>
                      </div>
                    )
                  }
                </FileDropzone>
                <FieldDescription>{FLORAL_MOCKUP_IMAGE_TYPES.join(', ')}</FieldDescription>
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          <div className='flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50/70 p-3 text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-400'>
            <InfoIcon className='mt-0.5 size-4 shrink-0' aria-hidden='true' />
            <p className='text-sm'>{t('floralMockups.form.activeHint')}</p>
          </div>

          <DialogFooter>
            <Button type='button' variant='outline' disabled={isSubmitting} onClick={() => handleOpenChange(false)}>
              {t('common.button.cancel')}
            </Button>
            <Button type='submit' disabled={isSubmitting}>
              {isSubmitting && <Spinner />}
              {t('floralMockups.form.submit')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
