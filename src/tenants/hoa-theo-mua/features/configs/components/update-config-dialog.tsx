import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Spinner } from '@/components/ui/spinner'
import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { useConfirmStore } from '@/lib/zustand/confirm.store'
import { SaveIcon, Trash2 } from 'lucide-react'
import { useEffect } from 'react'
import { FormProvider, type SubmitHandler } from 'react-hook-form'
import { useDeleteConfig } from '../hooks/use-delete-config'
import { useUpdateConfig } from '../hooks/use-update-config'
import type { Config } from '../types'
import type { CreateConfigFormValues } from '../validations'
import UpdateConfigForm from './update-config-form'

interface UpdateConfigDialogProps {
  open: boolean
  config: Config | null
  onClose: () => void
}

export default function UpdateConfigDialog({ open, config, onClose }: UpdateConfigDialogProps) {
  const { t } = useTenantTranslation()
  const { confirm } = useConfirmStore()
  const { methods, updateConfig, isUpdatingConfig } = useUpdateConfig(config?.id)
  const { deleteConfig, isDeletingConfig } = useDeleteConfig()

  useEffect(() => {
    if (open && config) {
      methods.reset({
        key: config.key,
        value: config.value as CreateConfigFormValues['value']
      })
    }
  }, [open, config, methods])

  const onSubmit: SubmitHandler<CreateConfigFormValues> = (body) => {
    updateConfig({ body }, { onSuccess: onClose })
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
    deleteConfig({ id: config.id }, { onSuccess: onClose })
  }

  const isSubmitting = isUpdatingConfig || isDeletingConfig

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className='flex max-h-[85vh] max-w-xl flex-col gap-0 p-0'>
        <DialogHeader className='px-6 pt-6 pb-4'>
          <DialogTitle>{t('configsPage.dialog.editTitle')}</DialogTitle>
        </DialogHeader>

        <div className='flex-1 overflow-y-auto px-6'>
          <FormProvider {...methods}>
            <form id='update-config-form' onSubmit={methods.handleSubmit(onSubmit)} className='pb-4'>
              <UpdateConfigForm />
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
          <Button type='button' variant='outline' disabled={isSubmitting} onClick={onClose}>
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
