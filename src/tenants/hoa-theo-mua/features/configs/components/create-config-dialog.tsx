import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Field, FieldContent, FieldDescription, FieldLabel } from '@/components/ui/field'
import { Spinner } from '@/components/ui/spinner'
import { Switch } from '@/components/ui/switch'
import { useUploadFileWithToast } from '@/hooks/use-upload-file-with-toast'
import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { SaveIcon } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Controller, FormProvider, type SubmitHandler } from 'react-hook-form'
import { useCreateConfig } from '../hooks/use-create-config'
import { InputType } from '../types'
import { defaultConfigFormValues, type CreateConfigFormInput, type CreateConfigFormValues } from '../validations'
import CreateConfigForm from './create-config-form'

interface CreateConfigDialogProps {
  open: boolean
  onClose: () => void
  initialValues?: Partial<CreateConfigFormInput>
  lockedFields?: { key?: boolean; options?: boolean; kind?: boolean }
}

const getGroupFromKey = (key: string): string => key.split('.')[0] ?? ''

const mergeInitialValues = (initial?: Partial<CreateConfigFormInput>): CreateConfigFormInput => {
  const key = initial?.key ?? defaultConfigFormValues.key
  const group = getGroupFromKey(key) || initial?.value?.group || initial?.group || defaultConfigFormValues.group

  return {
    ...defaultConfigFormValues,
    ...initial,
    key,
    group,
    value: {
      ...defaultConfigFormValues.value,
      ...initial?.value,
      group
    }
  }
}

export default function CreateConfigDialog({ open, onClose, initialValues, lockedFields }: CreateConfigDialogProps) {
  const { t } = useTenantTranslation()
  const { methods, createConfig, isCreatingConfig } = useCreateConfig()
  const { uploadFileWithToast, isUploading } = useUploadFileWithToast()
  const [pendingFile, setPendingFile] = useState<File | null>(null)

  useEffect(() => {
    if (open) {
      methods.reset(mergeInitialValues(initialValues))
    }
  }, [open, initialValues, methods])

  const handleClose = () => {
    setPendingFile(null)
    onClose()
  }

  const onSubmit: SubmitHandler<CreateConfigFormValues> = async (body) => {
    const group = getGroupFromKey(body.key) || body.value.group
    let resolvedValue = body.value.value

    if (pendingFile && body.value.inputType === InputType.file) {
      const url = await uploadFileWithToast({ file: pendingFile, showSuccessToast: false })
      if (!url) return
      resolvedValue = url
    }

    createConfig(
      {
        body: {
          ...body,
          group,
          value: {
            ...body.value,
            group,
            value: resolvedValue
          }
        }
      },
      { onSuccess: handleClose }
    )
  }

  const isSubmitting = isCreatingConfig || isUploading

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent
        position='top-center'
        className='flex max-w-xl flex-col gap-0 p-0 overflow-hidden'
        showCloseButton={false}
      >
        <DialogHeader className='px-6 pt-6 pb-4'>
          <DialogTitle>{t('configsPage.dialog.createTitle')}</DialogTitle>
        </DialogHeader>

        <div className='min-h-0 flex-1 overflow-y-auto px-6'>
          <FormProvider {...methods}>
            <form id='create-config-form' onSubmit={methods.handleSubmit(onSubmit)} className='pb-4'>
              <CreateConfigForm lockedFields={lockedFields} onPendingFileChange={setPendingFile} />

              <Controller
                name='isPublic'
                control={methods.control}
                render={({ field, fieldState }) => (
                  <Field
                    orientation='horizontal'
                    data-invalid={fieldState.invalid}
                    className='p-3 bg-muted/50 rounded-xl border border-dashed flex justify-between mt-2'
                  >
                    <FieldContent className='gap-0'>
                      <FieldLabel htmlFor={field.name}>{t('configsPage.dialog.isPublicField')}</FieldLabel>
                      <FieldDescription className='text-xs'>
                        {t('configsPage.dialog.isPublicDescription')}
                      </FieldDescription>
                    </FieldContent>
                    <Switch
                      id={field.name}
                      name={field.name}
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      aria-invalid={fieldState.invalid}
                    />
                  </Field>
                )}
              />
            </form>
          </FormProvider>
        </div>

        <DialogFooter className='pb-6 px-6'>
          <Button type='button' variant='outline' disabled={isSubmitting} onClick={handleClose}>
            {t('configsPage.dialog.cancel')}
          </Button>
          <Button type='submit' form='create-config-form' disabled={isSubmitting}>
            {isSubmitting ? <Spinner data-icon='inline-start' /> : <SaveIcon data-icon='inline-start' />}
            {isSubmitting ? t('configsPage.dialog.saving') : t('configsPage.dialog.save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
