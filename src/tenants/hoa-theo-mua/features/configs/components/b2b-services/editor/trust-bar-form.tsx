import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import {
  defaultLogoItem,
  type LogoGroup,
  type LogoItem,
  type OverviewTrustBar,
  type StatItem
} from '../../../b2b-overview-palette'
import { AddRowButton, ImageUploadField, ListRow, LocalizedField, useListOps } from '../b2b-section-editors'
import type { PreviewLocale } from '../preview/preview-shared'
import { Accordion, ItemRow, previewLabel, SectionCard, updateInList } from './editor-shared'

function LogoItemList({
  items,
  onChange,
  locale
}: {
  items: LogoItem[]
  onChange: (next: LogoItem[]) => void
  locale: PreviewLocale
}) {
  const { t } = useTenantTranslation()
  const { update, remove, move } = useListOps(items, onChange)

  return (
    <div className='space-y-2'>
      <div className='flex items-center justify-end'>
        <AddRowButton
          onClick={() => onChange([...items, defaultLogoItem()])}
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
                label={t('configsPage.b2bOverviewDialog.field.logoImage')}
                value={item.image}
                onChange={(image) => update(index, { ...item, image })}
              />
              <LocalizedField
                label={t('configsPage.b2bOverviewDialog.field.logoName')}
                value={item.name}
                onChange={(name) => update(index, { ...item, name })}
                locale={locale}
              />
            </ListRow>
          ))}
        </Accordion>
      )}
    </div>
  )
}

export function TrustBarForm({
  value,
  onChange,
  locale
}: {
  value: OverviewTrustBar
  onChange: (next: OverviewTrustBar) => void
  locale: PreviewLocale
}) {
  const { t } = useTenantTranslation()

  return (
    <SectionCard
      title={t('configsPage.b2bOverviewDialog.section.trustBar')}
      description={t('configsPage.b2bOverviewDialog.section.trustBarHelp')}
    >
      <LocalizedField
        label={t('configsPage.b2bOverviewDialog.field.eyebrow')}
        value={value.eyebrow}
        onChange={(eyebrow) => onChange({ ...value, eyebrow })}
        locale={locale}
      />
      <LocalizedField
        label={t('configsPage.b2bOverviewDialog.field.logosAriaLabel')}
        value={value.logos.ariaLabel}
        onChange={(ariaLabel) => onChange({ ...value, logos: { ...value.logos, ariaLabel } })}
        locale={locale}
      />

      <div className='text-xs font-medium text-muted-foreground'>{t('configsPage.b2bOverviewDialog.field.stats')}</div>
      <Accordion type='multiple' className='space-y-2'>
        {value.stats.map((stat: StatItem, index) => (
          <ItemRow key={stat.id} index={index} label={previewLabel(stat.label, stat.id)}>
            <LocalizedField
              label={t('configsPage.b2bOverviewDialog.field.statValue')}
              value={stat.value}
              onChange={(statValue) =>
                onChange({ ...value, stats: updateInList(value.stats, index, { ...stat, value: statValue }) })
              }
              locale={locale}
            />
            <LocalizedField
              label={t('configsPage.b2bOverviewDialog.field.statLabel')}
              value={stat.label}
              onChange={(label) => onChange({ ...value, stats: updateInList(value.stats, index, { ...stat, label }) })}
              locale={locale}
            />
          </ItemRow>
        ))}
      </Accordion>

      <div className='text-xs font-medium text-muted-foreground'>
        {t('configsPage.b2bOverviewDialog.field.logoGroups')}
      </div>
      <Accordion type='multiple' className='space-y-2'>
        {value.logos.groups.map((group: LogoGroup, gIndex) => (
          <ItemRow key={group.id} index={gIndex} label={previewLabel(group.label, group.id)}>
            <LocalizedField
              label={t('configsPage.b2bOverviewDialog.field.groupLabel')}
              value={group.label}
              onChange={(label) =>
                onChange({
                  ...value,
                  logos: { ...value.logos, groups: updateInList(value.logos.groups, gIndex, { ...group, label }) }
                })
              }
              locale={locale}
            />
            <LogoItemList
              items={group.items}
              onChange={(items) =>
                onChange({
                  ...value,
                  logos: { ...value.logos, groups: updateInList(value.logos.groups, gIndex, { ...group, items }) }
                })
              }
              locale={locale}
            />
          </ItemRow>
        ))}
      </Accordion>
    </SectionCard>
  )
}
