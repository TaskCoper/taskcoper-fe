import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Spinner } from '@/components/ui/spinner'
import { useUploadFileWithToast } from '@/hooks/use-upload-file-with-toast'
import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { SaveIcon } from 'lucide-react'
import { useEffect, useState } from 'react'
import { FormProvider, type SubmitHandler } from 'react-hook-form'
import { useCreateConfig } from '../../hooks/use-create-config'
import { InputType } from '../../types'
import { defaultConfigFormValues, type CreateConfigFormInput, type CreateConfigFormValues } from '../../validations'
import { composeConfigBody, getGroupFromKey, useUnsavedCloseGuard } from './config-dialog-shared'
import CreateConfigForm from './create-config-form'
import IsPublicField from './is-public-field'

interface CreateConfigDialogProps {
  open: boolean
  onClose: () => void
  initialValues?: Partial<CreateConfigFormInput>
  lockedFields?: { key?: boolean; options?: boolean; kind?: boolean }
}

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

  const requestClose = useUnsavedCloseGuard(methods.formState.isDirty, handleClose)

  const onSubmit: SubmitHandler<CreateConfigFormValues> = async (body) => {
    let resolvedValue = body.value.value

    if (pendingFile && body.value.inputType === InputType.file) {
      const url = await uploadFileWithToast({ file: pendingFile, showSuccessToast: false })
      if (!url) return
      resolvedValue = url
    }

    createConfig({ body: composeConfigBody(body, resolvedValue) }, { onSuccess: handleClose })
  }

  const isSubmitting = isCreatingConfig || isUploading

  return (
    <Dialog open={open} onOpenChange={(o) => !o && void requestClose()}>
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

              <IsPublicField control={methods.control} />
            </form>
          </FormProvider>
        </div>

        <DialogFooter className='pb-6 px-6'>
          <Button type='button' variant='outline' disabled={isSubmitting} onClick={() => void requestClose()}>
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
