import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Field, FieldContent, FieldDescription, FieldLabel } from '@/components/ui/field'
import { Spinner } from '@/components/ui/spinner'
import { Switch } from '@/components/ui/switch'
import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { SaveIcon } from 'lucide-react'
import { useEffect } from 'react'
import { Controller, FormProvider, type SubmitHandler } from 'react-hook-form'
import { useCreateConfig } from '../hooks/use-create-config'
import { defaultConfigFormValues, type CreateConfigFormInput, type CreateConfigFormValues } from '../validations'
import CreateConfigForm from './create-config-form'

interface CreateConfigDialogProps {
  open: boolean
  onClose: () => void
  initialValues?: Partial<CreateConfigFormInput>
  lockedFields?: { key?: boolean; options?: boolean }
}

const mergeInitialValues = (initial?: Partial<CreateConfigFormInput>): CreateConfigFormInput => ({
  ...defaultConfigFormValues,
  ...initial,
  key: initial?.key ?? defaultConfigFormValues.key,
  value: {
    ...defaultConfigFormValues.value,
    ...initial?.value
  }
})

export default function CreateConfigDialog({ open, onClose, initialValues, lockedFields }: CreateConfigDialogProps) {
  const { t } = useTenantTranslation()
  const { methods, createConfig, isCreatingConfig } = useCreateConfig()

  useEffect(() => {
    if (open) {
      methods.reset(mergeInitialValues(initialValues))
    }
  }, [open, initialValues, methods])

  const onSubmit: SubmitHandler<CreateConfigFormValues> = (body) => {
    createConfig({ body }, { onSuccess: onClose })
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent position='top-center' className='flex max-w-xl flex-col gap-0 p-0' showCloseButton={false}>
        <DialogHeader className='px-6 pt-6 pb-4'>
          <DialogTitle>{t('configsPage.dialog.createTitle')}</DialogTitle>
        </DialogHeader>

        <div className='flex-1 overflow-y-auto px-6'>
          <FormProvider {...methods}>
            <form id='create-config-form' onSubmit={methods.handleSubmit(onSubmit)} className='pb-4'>
              <CreateConfigForm lockedFields={lockedFields} />

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
