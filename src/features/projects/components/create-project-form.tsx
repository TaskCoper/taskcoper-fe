import { ComboboxMultiField } from '@/components/combobox-multifield'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { useGetDomains } from '@/hooks/use-get-domains'
import { Controller, useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import type { CreateProjectFormValues } from '../validations'

export default function CreateProjectForm() {
  const { t } = useTranslation()
  const { control } = useFormContext<CreateProjectFormValues>()

  const { domains, isLoadingDomains } = useGetDomains()

  return (
    <div className='flex flex-col gap-2 w-full'>
      <Controller
        name='name'
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid} className='gap-1'>
            <FieldLabel htmlFor={field.name} className='gap-0.5'>
              {t('project.createProject.field.name.label')}
              <span className='text-destructive font-semibold'>*</span>
            </FieldLabel>

            <Input
              {...field}
              id={field.name}
              aria-invalid={fieldState.invalid}
              placeholder={t('project.createProject.field.name.placeholder')}
              autoComplete='off'
              spellCheck={false}
              autoFocus={true}
            />

            <div className='min-h-4'>
              {fieldState.invalid && <FieldError className='text-xs' errors={[fieldState.error]} />}
            </div>
          </Field>
        )}
      />

      <ComboboxMultiField
        control={control}
        name='domainIds'
        label='project.createProject.field.domain.label'
        options={domains.value.items.map((domain) => ({
          label: domain.name,
          value: String(domain.id)
        }))}
        disabled={isLoadingDomains || domains.value.items.length === 0}
        placeholder='project.createProject.field.domain.placeholder'
        searchPlaceholder='project.createProject.field.domain.searchPlaceholder'
        isRequired
        modal
      />

      {/* <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
        <DatePickerField
          control={control}
          name='startDate'
          label='project.createProject.field.startDate.label'
          placeholder='project.createProject.field.startDate.placeholder'
          isRequired
        />

        <DatePickerField
          control={control}
          name='endDate'
          label='project.createProject.field.endDate.label'
          placeholder='project.createProject.field.endDate.placeholder'
          isRequired
        />
      </div> */}

      {/* <Controller
        name='description'
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid} className='gap-1'>
            <FieldLabel htmlFor={field.name}>{t('project.createProject.field.description.label')}</FieldLabel>
            <InputGroup>
              <InputGroupTextarea
                {...field}
                id={field.name}
                placeholder={t('project.createProject.field.description.placeholder')}
                rows={6}
                className='min-h-24 resize-none break-all'
                aria-invalid={fieldState.invalid}
              />
              <InputGroupAddon align='block-end'>
                <InputGroupText className='tabular-nums text-xs'>
                  {field.value.length}/255 {t('common.characters')}
                </InputGroupText>
              </InputGroupAddon>
            </InputGroup>
            <FieldDescription>{t('project.createProject.field.description.description')}</FieldDescription>
          </Field>
        )}
      /> */}
    </div>
  )
}
