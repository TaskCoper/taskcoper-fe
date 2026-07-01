import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Field, FieldContent, FieldDescription, FieldLabel } from '@/components/ui/field'
import { Spinner } from '@/components/ui/spinner'
import { Switch } from '@/components/ui/switch'
import { useUploadFileWithToast } from '@/hooks/use-upload-file-with-toast'
import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { useConfirmStore } from '@/lib/zustand/confirm.store'
import { EyeIcon, SaveIcon, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Controller, FormProvider, type SubmitHandler } from 'react-hook-form'
import { useDeleteConfig } from '../hooks/use-delete-config'
import { useRevealConfig } from '../hooks/use-reveal-config'
import { useUpdateConfig } from '../hooks/use-update-config'
import { isLockedAsyncConfigKey } from '../locked-config-keys'
import { ConfigKind, InputType, type Config } from '../types'
import type { CreateConfigFormValues } from '../validations'
import UpdateConfigForm from './update-config-form'

interface UpdateConfigDialogProps {
  open: boolean
  config: Config | null
  onClose: () => void
  liveOptionsByKey?: Record<string, { label: string; value: string | number }[]>
}

const getGroupFromKey = (key: string): string => key.split('.')[0] ?? ''

export default function UpdateConfigDialog({ open, config, onClose, liveOptionsByKey }: UpdateConfigDialogProps) {
  const { t } = useTenantTranslation()
  const { confirm } = useConfirmStore()
  const { methods, updateConfig, isUpdatingConfig } = useUpdateConfig(config?.id)
  const { deleteConfig, isDeletingConfig } = useDeleteConfig()
  const { uploadFileWithToast, isUploading } = useUploadFileWithToast()
  const { revealConfig, isRevealingConfig } = useRevealConfig()
  const [pendingFile, setPendingFile] = useState<File | null>(null)
  const [isRevealed, setIsRevealed] = useState(false)

  const isLocked = isLockedAsyncConfigKey(config?.key)
  const isSecret = config?.kind === ConfigKind.secret

  const handleReveal = () => {
    if (!config) return
    revealConfig(
      { id: config.id },
      {
        onSuccess: (revealed) => {
          methods.setValue('value.value', revealed.value.value, { shouldDirty: false, shouldValidate: true })
          setIsRevealed(true)
        }
      }
    )
  }

  useEffect(() => {
    if (open && config) {
      const liveOptions = config.key ? liveOptionsByKey?.[config.key] : undefined
      const group = getGroupFromKey(config.key) || config.value.group
      methods.reset({
        key: config.key,
        group,
        kind: config.kind,
        isPublic: config.isPublic ?? false,
        value: {
          ...(config.value as CreateConfigFormValues['value']),
          group,
          options: liveOptions ?? (config.value as CreateConfigFormValues['value']).options
        }
      })
    }
  }, [open, config, methods, liveOptionsByKey])

  const handleClose = () => {
    setPendingFile(null)
    setIsRevealed(false)
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

    updateConfig(
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

  const handleDelete = async () => {
    if (!config) return
    const confirmed = await confirm({
      title: t('configsPage.confirm.deleteTitle'),
      description: t('configsPage.confirm.deleteDescription'),
      confirmText: t('configsPage.confirm.deleteConfirm'),
      cancelText: t('configsPage.confirm.deleteCancel'),
      variant: 'destructive'
    })
    if (!confirmed) return
    deleteConfig({ id: config.id }, { onSuccess: handleClose })
  }

  const isSubmitting = isUpdatingConfig || isDeletingConfig || isUploading

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent position='top-center' className='flex max-w-xl flex-col gap-0 p-0'>
        <DialogHeader className='px-6 pt-6 pb-4'>
          <DialogTitle>{t('configsPage.dialog.editTitle')}</DialogTitle>
        </DialogHeader>

        <div className='flex-1 overflow-y-auto px-6'>
          {isSecret && !isRevealed && (
            <div className='mb-4 flex items-center gap-3 rounded-lg border border-dashed bg-muted/40 p-3'>
              <div className='flex-1 text-xs text-muted-foreground'>{t('configsPage.dialog.secretHint')}</div>
              <Button type='button' size='sm' variant='outline' disabled={isRevealingConfig} onClick={handleReveal}>
                {isRevealingConfig ? <Spinner data-icon='inline-start' /> : <EyeIcon data-icon='inline-start' />}
                {t('configsPage.dialog.revealSecret')}
              </Button>
            </div>
          )}
          <FormProvider {...methods}>
            <form id='update-config-form' onSubmit={methods.handleSubmit(onSubmit)} className='pb-4'>
              <UpdateConfigForm
                lockedFields={isLocked ? { key: true, options: true, kind: true } : undefined}
                onPendingFileChange={setPendingFile}
              />
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

        <DialogFooter className='border-t px-6 py-4'>
          <Button
            type='button'
            variant='destructive'
            className='mr-auto'
            disabled={isSubmitting}
            onClick={handleDelete}
          >
            <Trash2 className='size-3.5' />
            {t('configsPage.dialog.delete')}
          </Button>
          <Button type='button' variant='outline' disabled={isSubmitting} onClick={handleClose}>
            {t('configsPage.dialog.cancel')}
          </Button>
          <Button type='submit' form='update-config-form' disabled={isSubmitting}>
            {isSubmitting ? <Spinner data-icon='inline-start' /> : <SaveIcon data-icon='inline-start' />}
            {isSubmitting ? t('configsPage.dialog.saving') : t('configsPage.dialog.save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
