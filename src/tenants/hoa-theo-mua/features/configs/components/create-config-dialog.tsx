import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Spinner } from '@/components/ui/spinner'
import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { SaveIcon } from 'lucide-react'
import { useEffect } from 'react'
import { FormProvider, type SubmitHandler } from 'react-hook-form'
import { useCreateConfig } from '../hooks/use-create-config'
import type { InputType } from '../types'
import type { CreateConfigFormValues } from '../validations'
import CreateConfigForm from './create-config-form'

interface CreateConfigDialogProps {
  open: boolean
  onClose: () => void
  initialInputType?: InputType
  initialGroup?: string
}

export default function CreateConfigDialog({ open, onClose, initialInputType, initialGroup }: CreateConfigDialogProps) {
  const { t } = useTenantTranslation()
  const { methods, createConfig, isCreatingConfig } = useCreateConfig()

  useEffect(() => {
    if (open) {
      methods.reset({
        key: initialGroup ? `${initialGroup}.` : '',
        value: {
          group: initialGroup ?? '',
          label: '',
          inputType: initialInputType ?? 'text',
          value: undefined,
          required: false,
          options: [],
          validations: []
        }
      })
    }
  }, [open, initialInputType, initialGroup, methods])

  const onSubmit: SubmitHandler<CreateConfigFormValues> = (body) => {
    createConfig({ body }, { onSuccess: onClose })
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className='flex max-h-[85vh] max-w-xl flex-col gap-0 p-0'>
        <DialogHeader className='px-6 pt-6 pb-4'>
          <DialogTitle>{t('configsPage.dialog.createTitle')}</DialogTitle>
        </DialogHeader>

        <div className='flex-1 overflow-y-auto px-6'>
          <FormProvider {...methods}>
            <form id='create-config-form' onSubmit={methods.handleSubmit(onSubmit)} className='pb-4'>
              <CreateConfigForm />
            </form>
          </FormProvider>
        </div>

        <DialogFooter className='border-t px-6 py-4'>
          <Button type='button' variant='outline' disabled={isCreatingConfig} onClick={onClose}>
            {t('configsPage.dialog.cancel')}
          </Button>
          <Button type='submit' form='create-config-form' disabled={isCreatingConfig}>
            {isCreatingConfig ? <Spinner data-icon='inline-start' /> : <SaveIcon data-icon='inline-start' />}
            {isCreatingConfig ? t('configsPage.dialog.saving') : t('configsPage.dialog.save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
