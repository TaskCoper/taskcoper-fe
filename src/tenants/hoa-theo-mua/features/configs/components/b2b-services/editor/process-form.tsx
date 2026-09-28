import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { defaultProcessStep } from '../../../b2b-overview-palette'
import { type OverviewProcess, type ProcessStep } from '../../../types'
import { AddRowButton, IconPickerField, ListRow, LocalizedField, useListOps } from '../b2b-section-editors'
import type { PreviewLocale } from '../preview/preview-shared'
import { Accordion, previewLabel, SectionCard } from './editor-shared'

function ProcessStepList({
  steps,
  onChange,
  locale
}: {
  steps: ProcessStep[]
  onChange: (next: ProcessStep[]) => void
  locale: PreviewLocale
}) {
  const { t } = useTenantTranslation()
  const { update, remove, move } = useListOps(steps, onChange)

  return (
    <div className='space-y-2'>
      <div className='flex items-center justify-end'>
        <AddRowButton
          onClick={() => onChange([...steps, defaultProcessStep()])}
          label={t('configsPage.b2bServicesDialog.item.add')}
        />
      </div>
      {steps.length === 0 ? (
        <p className='rounded-lg border border-dashed py-6 text-center text-xs text-muted-foreground'>
          {t('configsPage.b2bServicesDialog.item.empty')}
        </p>
      ) : (
        <Accordion type='multiple' className='space-y-2'>
          {steps.map((step, index) => (
            <ListRow
              key={step.id}
              index={index}
              total={steps.length}
              label={previewLabel(step.title, t('configsPage.b2bServicesDialog.item.untitled', { index: index + 1 }))}
              onRemove={() => remove(index)}
              onMove={(dir) => move(index, dir)}
            >
              <IconPickerField
                label={t('configsPage.b2bOverviewDialog.field.icon')}
                value={step.icon}
                onChange={(icon) => update(index, { ...step, icon })}
              />
              <LocalizedField
                label={t('configsPage.b2bOverviewDialog.field.stepLabel')}
                value={step.label}
                onChange={(label) => update(index, { ...step, label })}
                locale={locale}
              />
              <LocalizedField
                label={t('configsPage.b2bOverviewDialog.field.itemTitle')}
                value={step.title}
                onChange={(title) => update(index, { ...step, title })}
                locale={locale}
              />
              <LocalizedField
                label={t('configsPage.b2bOverviewDialog.field.itemDescription')}
                value={step.description}
                onChange={(description) => update(index, { ...step, description })}
                textarea
                locale={locale}
              />
            </ListRow>
          ))}
        </Accordion>
      )}
    </div>
  )
}

export function ProcessForm({
  value,
  onChange,
  locale
}: {
  value: OverviewProcess
  onChange: (next: OverviewProcess) => void
  locale: PreviewLocale
}) {
  const { t } = useTenantTranslation()

  return (
    <SectionCard title={t('configsPage.b2bOverviewDialog.section.process')}>
      <LocalizedField
        label={t('configsPage.b2bOverviewDialog.field.eyebrow')}
        value={value.eyebrow}
        onChange={(eyebrow) => onChange({ ...value, eyebrow })}
        locale={locale}
      />
      <LocalizedField
        label={t('configsPage.b2bOverviewDialog.field.title')}
        value={value.title}
        onChange={(title) => onChange({ ...value, title })}
        locale={locale}
      />
      <LocalizedField
        label={t('configsPage.b2bOverviewDialog.field.description')}
        value={value.description}
        onChange={(description) => onChange({ ...value, description })}
        textarea
        locale={locale}
      />
      <ProcessStepList steps={value.steps} onChange={(steps) => onChange({ ...value, steps })} locale={locale} />
    </SectionCard>
  )
}
