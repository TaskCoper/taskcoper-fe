import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { defaultAdvantageItem, type AdvantageItem, type OverviewAdvantages } from '../../../b2b-overview-palette'
import { AddRowButton, IconPickerField, ListRow, LocalizedField, useListOps } from '../b2b-section-editors'
import type { PreviewLocale } from '../preview/preview-shared'
import { Accordion, previewLabel, SectionCard } from './editor-shared'

function AdvantageItemList({
  items,
  onChange,
  locale
}: {
  items: AdvantageItem[]
  onChange: (next: AdvantageItem[]) => void
  locale: PreviewLocale
}) {
  const { t } = useTenantTranslation()
  const { update, remove, move } = useListOps(items, onChange)

  return (
    <div className='space-y-2'>
      <div className='flex items-center justify-end'>
        <AddRowButton
          onClick={() => onChange([...items, defaultAdvantageItem()])}
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
              label={previewLabel(item.title, t('configsPage.b2bServicesDialog.item.untitled', { index: index + 1 }))}
              onRemove={() => remove(index)}
              onMove={(dir) => move(index, dir)}
            >
              <IconPickerField
                label={t('configsPage.b2bOverviewDialog.field.icon')}
                value={item.icon}
                onChange={(icon) => update(index, { ...item, icon })}
              />
              <LocalizedField
                label={t('configsPage.b2bOverviewDialog.field.itemTitle')}
                value={item.title}
                onChange={(title) => update(index, { ...item, title })}
                locale={locale}
              />
              <LocalizedField
                label={t('configsPage.b2bOverviewDialog.field.itemDescription')}
                value={item.description}
                onChange={(description) => update(index, { ...item, description })}
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

export function AdvantagesForm({
  value,
  onChange,
  locale
}: {
  value: OverviewAdvantages
  onChange: (next: OverviewAdvantages) => void
  locale: PreviewLocale
}) {
  const { t } = useTenantTranslation()

  return (
    <SectionCard title={t('configsPage.b2bOverviewDialog.section.advantages')}>
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
      <AdvantageItemList items={value.items} onChange={(items) => onChange({ ...value, items })} locale={locale} />
    </SectionCard>
  )
}
