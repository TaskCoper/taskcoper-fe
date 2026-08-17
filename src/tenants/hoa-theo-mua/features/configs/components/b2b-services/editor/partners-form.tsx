import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { defaultPartnerItem, type OverviewCaseStudies, type PartnerItem } from '../../../b2b-overview-palette'
import { AddRowButton, ImageUploadField, ListRow, LocalizedField, useListOps } from '../b2b-section-editors'
import type { PreviewLocale } from '../preview/preview-shared'
import { Accordion, previewLabel, SectionCard } from './editor-shared'

type PartnersSection = OverviewCaseStudies['partners']

function PartnerItemList({
  items,
  onChange,
  locale
}: {
  items: PartnerItem[]
  onChange: (next: PartnerItem[]) => void
  locale: PreviewLocale
}) {
  const { t } = useTenantTranslation()
  const { update, remove, move } = useListOps(items, onChange)

  return (
    <div className='space-y-2'>
      <div className='flex items-center justify-end'>
        <AddRowButton
          onClick={() => onChange([...items, defaultPartnerItem()])}
          label={t('configsPage.b2bServicesDialog.item.add')}
        />
      </div>
      {items.length === 0 ? (
        <p className='rounded-lg border border-dashed py-6 text-center text-xs text-muted-foreground'>
          {t('configsPage.b2bServicesDialog.item.empty')}
        </p>
      ) : (
        <Accordion type='multiple' className='space-y-2'>
          {items.map((item, index) => (
            <ListRow
              key={item.id}
              index={index}
              total={items.length}
              label={previewLabel(item.name, t('configsPage.b2bServicesDialog.item.untitled', { index: index + 1 }))}
              onRemove={() => remove(index)}
              onMove={(dir) => move(index, dir)}
            >
              <ImageUploadField
                aspectRatio={null}
                label={t('configsPage.b2bOverviewDialog.field.partnerLogo')}
                value={item.logo}
                onChange={(logo) => update(index, { ...item, logo })}
              />
              <LocalizedField
                label={t('configsPage.b2bOverviewDialog.field.partnerName')}
                value={item.name}
                onChange={(name) => update(index, { ...item, name })}
                locale={locale}
              />
              <LocalizedField
                label={t('configsPage.b2bOverviewDialog.field.partnerRole')}
                value={item.role}
                onChange={(role) => update(index, { ...item, role })}
                locale={locale}
              />
              <LocalizedField
                label={t('configsPage.b2bOverviewDialog.field.partnerSummary')}
                value={item.summary}
                onChange={(summary) => update(index, { ...item, summary })}
                textarea
                rows={3}
                locale={locale}
              />
              <LocalizedField
                label={t('configsPage.b2bOverviewDialog.field.logoAlt')}
                value={item.logoAlt}
                onChange={(logoAlt) => update(index, { ...item, logoAlt })}
                locale={locale}
              />
            </ListRow>
          ))}
        </Accordion>
      )}
    </div>
  )
}

export function PartnersForm({
  value,
  onChange,
  locale
}: {
  value: PartnersSection
  onChange: (next: PartnersSection) => void
  locale: PreviewLocale
}) {
  const { t } = useTenantTranslation()

  return (
    <SectionCard title={t('configsPage.b2bOverviewDialog.section.partners')}>
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
      <PartnerItemList items={value.items} onChange={(items) => onChange({ ...value, items })} locale={locale} />
    </SectionCard>
  )
}
