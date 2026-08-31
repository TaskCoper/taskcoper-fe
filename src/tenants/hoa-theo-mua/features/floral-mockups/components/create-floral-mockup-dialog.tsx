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
import { CheckCircle2Icon, ImageIcon, Trash2Icon, UploadCloudIcon } from 'lucide-react'
import { useMemo, useRef } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useCreateFloralMockup } from '../hooks/use-create-floral-mockup'
import {
  createFloralMockupSchema,
  FLORAL_MOCKUP_IMAGE_TYPES,
  MAX_FLORAL_MOCKUP_IMAGE_SIZE,
  type CreateFloralMockupFormValues
} from '../validations'

const defaultValues: CreateFloralMockupFormValues = {
  name: '',
  description: '',
  imageFile: null
}

const CreateFloralMockupDialog = ({
  open,
  onOpenChange,
  onCreated
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreated?: () => void
}) => {
  const { t } = useTenantTranslation()
  const schema = useMemo(() => createFloralMockupSchema(t), [t])
  const { createFloralMockup, isCreatingFloralMockup } = useCreateFloralMockup()
  const isSubmittingRef = useRef(false)
  const { control, handleSubmit, reset, setError, clearErrors } = useForm<CreateFloralMockupFormValues>({
    resolver: zodResolver(schema),
    defaultValues
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
      await createFloralMockup({
        name: values.name,
        description: values.description || null,
        imageFile: values.imageFile,
        isActive: true
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

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className='sm:max-w-2xl'>
        <DialogHeader>
          <DialogTitle>{t('floralMockups.form.title')}</DialogTitle>
          <DialogDescription>{t('floralMockups.form.description')}</DialogDescription>
        </DialogHeader>

        <form noValidate className='space-y-5' onSubmit={onSubmit}>
          <Controller
            name='name'
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid} className='gap-1.5'>
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
                  maxLength={50}
                  autoComplete='off'
                  autoFocus
                  placeholder={t('floralMockups.form.namePlaceholder')}
                />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          <Controller
            name='description'
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid} className='gap-1.5'>
                <div className='flex items-center justify-between gap-3'>
                  <FieldLabel htmlFor={field.name}>{t('floralMockups.form.mockupDescription')}</FieldLabel>
                  <span className='text-xs tabular-nums text-muted-foreground'>{field.value.length}/200</span>
                </div>
                <Textarea
                  {...field}
                  id={field.name}
                  aria-invalid={fieldState.invalid}
                  maxLength={200}
                  rows={3}
                  className='resize-none'
                  placeholder={t('floralMockups.form.descriptionPlaceholder')}
                />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          <Controller
            name='imageFile'
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid} className='gap-1.5'>
                <FieldLabel>
                  {t('floralMockups.form.image')}
                  <span className='text-destructive'>*</span>
                </FieldLabel>
                <FileDropzone
                  value={field.value}
                  accept={{ 'image/png': ['.png'], 'image/jpeg': ['.jpg', '.jpeg'] }}
                  maxSize={MAX_FLORAL_MOCKUP_IMAGE_SIZE}
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

          <div className='flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50/70 p-3 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-400'>
            <CheckCircle2Icon className='mt-0.5 size-4 shrink-0' aria-hidden='true' />
            <p className='text-sm'>{t('floralMockups.form.activeHint')}</p>
          </div>

          <DialogFooter>
            <Button
              type='button'
              variant='outline'
              disabled={isCreatingFloralMockup}
              onClick={() => handleOpenChange(false)}
            >
              {t('common.button.cancel')}
            </Button>
            <Button type='submit' disabled={isCreatingFloralMockup}>
              {isCreatingFloralMockup && <Spinner />}
              {t('floralMockups.form.submit')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default CreateFloralMockupDialog
