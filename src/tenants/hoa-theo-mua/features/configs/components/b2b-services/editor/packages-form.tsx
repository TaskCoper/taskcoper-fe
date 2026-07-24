import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { defaultPackageItem, type OverviewPackages, type PackageItem } from '../../../b2b-overview-palette'
import {
  AddRowButton,
  IconPickerField,
  ListRow,
  LocalizedField,
  LocalizedParagraphList,
  useListOps
} from '../b2b-section-editors'
import type { PreviewLocale } from '../preview/preview-shared'
import { Accordion, previewLabel, SectionCard } from './editor-shared'

function PackageItemList({
  items,
  onChange,
  locale
}: {
  items: PackageItem[]
  onChange: (next: PackageItem[]) => void
  locale: PreviewLocale
}) {
  const { t } = useTenantTranslation()
  const { update, remove, move } = useListOps(items, onChange)

  // Highlighting is exclusive — picking one clears the flag on every other package.
  const setHighlighted = (index: number, highlighted: boolean) =>
    onChange(items.map((it, i) => ({ ...it, highlighted: i === index ? highlighted : false })))

  return (
    <div className='space-y-2'>
      <div className='flex items-center justify-end'>
        <AddRowButton
          onClick={() => onChange([...items, defaultPackageItem()])}
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
              <IconPickerField
                label={t('configsPage.b2bOverviewDialog.field.icon')}
                value={item.icon}
                onChange={(icon) => update(index, { ...item, icon })}
              />
              <Label className='flex items-center gap-2 text-xs text-muted-foreground'>
                <Switch checked={item.highlighted} onCheckedChange={(checked) => setHighlighted(index, checked)} />
                {t('configsPage.b2bOverviewDialog.field.highlighted')}
              </Label>
              <LocalizedField
                label={t('configsPage.b2bOverviewDialog.field.packageName')}
                value={item.name}
                onChange={(name) => update(index, { ...item, name })}
                locale={locale}
              />
              <LocalizedField
                label={t('configsPage.b2bOverviewDialog.field.packageTarget')}
                value={item.target}
                onChange={(target) => update(index, { ...item, target })}
                textarea
                locale={locale}
              />
              <LocalizedField
                label={t('configsPage.b2bOverviewDialog.field.packagePrice')}
                value={item.price}
                onChange={(price) => update(index, { ...item, price })}
                locale={locale}
              />
              <div className='text-xs font-medium text-muted-foreground'>
                {t('configsPage.b2bOverviewDialog.field.features')}
              </div>
              <LocalizedParagraphList
                items={item.features}
                onChange={(features) => update(index, { ...item, features })}
                addLabel={t('configsPage.b2bServicesDialog.item.addFeature')}
                locale={locale}
              />
            </ListRow>
          ))}
        </Accordion>
      )}
    </div>
  )
}

export function PackagesForm({
  value,
  onChange,
  locale
}: {
  value: OverviewPackages
  onChange: (next: OverviewPackages) => void
  locale: PreviewLocale
}) {
  const { t } = useTenantTranslation()

  return (
    <SectionCard title={t('configsPage.b2bOverviewDialog.section.packages')}>
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
      <div className='grid grid-cols-1 gap-3 md:grid-cols-2'>
        <LocalizedField
          label={t('configsPage.b2bOverviewDialog.field.popular')}
          value={value.popular}
          onChange={(popular) => onChange({ ...value, popular })}
          locale={locale}
        />
        <LocalizedField
          label={t('configsPage.b2bOverviewDialog.field.fromLabel')}
          value={value.fromLabel}
          onChange={(fromLabel) => onChange({ ...value, fromLabel })}
          locale={locale}
        />
        <LocalizedField
          label={t('configsPage.b2bOverviewDialog.field.packageCta')}
          value={value.cta}
          onChange={(ctaText) => onChange({ ...value, cta: ctaText })}
          locale={locale}
        />
        <LocalizedField
          label={t('configsPage.b2bOverviewDialog.field.quarterlySuffix')}
          value={value.quarterlySuffix}
          onChange={(quarterlySuffix) => onChange({ ...value, quarterlySuffix })}
          locale={locale}
        />
      </div>
      <PackageItemList items={value.items} onChange={(items) => onChange({ ...value, items })} locale={locale} />
    </SectionCard>
  )
}
