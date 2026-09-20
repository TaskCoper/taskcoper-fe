import { Field, FieldContent, FieldDescription, FieldLabel } from '@/components/ui/field'
import { Switch } from '@/components/ui/switch'
import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { Controller, type Control } from 'react-hook-form'
import type { CreateConfigFormInput, CreateConfigFormValues } from '../../validations'

export default function IsPublicField({
  control
}: {
  control: Control<CreateConfigFormInput, unknown, CreateConfigFormValues>
}) {
  const { t } = useTenantTranslation()

  return (
    <Controller
      name='isPublic'
      control={control}
      render={({ field, fieldState }) => (
        <Field
          orientation='horizontal'
          data-invalid={fieldState.invalid}
          className='mt-2 flex justify-between rounded-xl border border-dashed bg-muted/50 p-3'
        >
          <FieldContent className='gap-0'>
            <FieldLabel htmlFor={field.name}>{t('configsPage.dialog.isPublicField')}</FieldLabel>
            <FieldDescription className='text-xs'>{t('configsPage.dialog.isPublicDescription')}</FieldDescription>
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
  )
}
