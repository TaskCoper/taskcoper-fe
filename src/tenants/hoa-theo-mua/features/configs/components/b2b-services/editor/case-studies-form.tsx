import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { defaultCaseStudyItem, type CaseStudyItem, type OverviewCaseStudies } from '../../../b2b-overview-palette'
import {
  AddRowButton,
  ImageUploadField,
  ImageUploadList,
  ListRow,
  LocalizedField,
  useListOps
} from '../b2b-section-editors'
import type { PreviewLocale } from '../preview/preview-shared'
import { Accordion, previewLabel, SectionCard } from './editor-shared'

function CaseStudyList({
  items,
  onChange,
  locale
}: {
  items: CaseStudyItem[]
  onChange: (next: CaseStudyItem[]) => void
  locale: PreviewLocale
}) {
  const { t } = useTenantTranslation()
  const { update, remove, move } = useListOps(items, onChange)

  return (
    <div className='space-y-2'>
      <div className='flex items-center justify-end'>
        <AddRowButton
          onClick={() => onChange([...items, defaultCaseStudyItem()])}
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
              label={previewLabel(item.logoAlt, t('configsPage.b2bServicesDialog.item.untitled', { index: index + 1 }))}
              onRemove={() => remove(index)}
              onMove={(dir) => move(index, dir)}
            >
              <ImageUploadField
                aspectRatio={null}
                label={t('configsPage.b2bOverviewDialog.field.caseStudyLogo')}
                value={item.logo}
                onChange={(logo) => update(index, { ...item, logo })}
              />
              <LocalizedField
                label={t('configsPage.b2bOverviewDialog.field.logoAlt')}
                value={item.logoAlt}
                onChange={(logoAlt) => update(index, { ...item, logoAlt })}
                locale={locale}
              />
              <LocalizedField
                label={t('configsPage.b2bOverviewDialog.field.badge')}
                value={item.badge}
                onChange={(badge) => update(index, { ...item, badge })}
                locale={locale}
              />
              <LocalizedField
                label={t('configsPage.b2bOverviewDialog.field.summary')}
                value={item.summary}
                onChange={(summary) => update(index, { ...item, summary })}
                textarea
                rows={4}
                locale={locale}
              />
              <LocalizedField
                label={t('configsPage.b2bOverviewDialog.field.quote')}
                value={item.quote}
                onChange={(quote) => update(index, { ...item, quote })}
                textarea
                locale={locale}
              />
              <LocalizedField
                label={t('configsPage.b2bOverviewDialog.field.quoteAuthor')}
                value={item.quoteAuthor}
                onChange={(quoteAuthor) => update(index, { ...item, quoteAuthor })}
                locale={locale}
              />
              <LocalizedField
                label={t('configsPage.b2bOverviewDialog.field.quoteRole')}
                value={item.quoteRole}
                onChange={(quoteRole) => update(index, { ...item, quoteRole })}
                locale={locale}
              />
              <ImageUploadList items={item.photos} onChange={(photos) => update(index, { ...item, photos })} />
            </ListRow>
          ))}
        </Accordion>
      )}
    </div>
  )
}

export function CaseStudiesForm({
  value,
  onChange,
  locale
}: {
  value: OverviewCaseStudies
  onChange: (next: OverviewCaseStudies) => void
  locale: PreviewLocale
}) {
  const { t } = useTenantTranslation()

  return (
    <SectionCard title={t('configsPage.b2bOverviewDialog.section.caseStudies')}>
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
      <CaseStudyList items={value.items} onChange={(items) => onChange({ ...value, items })} locale={locale} />
    </SectionCard>
  )
}
