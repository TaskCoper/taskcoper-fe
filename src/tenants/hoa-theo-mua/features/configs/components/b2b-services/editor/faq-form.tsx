import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { defaultOverviewFaqItem } from '../../../b2b-overview-palette'
import { type OverviewFaq, type OverviewFaqItem } from '../../../types'
import { AddRowButton, ListRow, LocalizedField, useListOps } from '../b2b-section-editors'
import type { PreviewLocale } from '../preview/preview-shared'
import { Accordion, previewLabel, SectionCard } from './editor-shared'

function FaqItemList({
  items,
  onChange,
  locale
}: {
  items: OverviewFaqItem[]
  onChange: (next: OverviewFaqItem[]) => void
  locale: PreviewLocale
}) {
  const { t } = useTenantTranslation()
  const { update, remove, move } = useListOps(items, onChange)

  return (
    <div className='space-y-2'>
      <div className='flex items-center justify-end'>
        <AddRowButton
          onClick={() => onChange([...items, defaultOverviewFaqItem()])}
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
              label={previewLabel(
                item.question,
                t('configsPage.b2bServicesDialog.item.untitled', { index: index + 1 })
              )}
              onRemove={() => remove(index)}
              onMove={(dir) => move(index, dir)}
            >
              <LocalizedField
                label={t('configsPage.b2bOverviewDialog.field.faqQuestion')}
                value={item.question}
                onChange={(question) => update(index, { ...item, question })}
                locale={locale}
              />
              <LocalizedField
                label={t('configsPage.b2bOverviewDialog.field.faqAnswer')}
                value={item.answer}
                onChange={(answer) => update(index, { ...item, answer })}
                textarea
                rows={3}
                description={t('configsPage.b2bOverviewDialog.field.faqAnswerHelp')}
                locale={locale}
              />
              <Label className='flex items-center gap-2 text-xs text-muted-foreground'>
                <Switch checked={item.hasZalo} onCheckedChange={(hasZalo) => update(index, { ...item, hasZalo })} />
                {t('configsPage.b2bOverviewDialog.field.faqHasZalo')}
              </Label>
            </ListRow>
          ))}
        </Accordion>
      )}
    </div>
  )
}

export function FaqForm({
  value,
  onChange,
  locale
}: {
  value: OverviewFaq
  onChange: (next: OverviewFaq) => void
  locale: PreviewLocale
}) {
  const { t } = useTenantTranslation()

  return (
    <SectionCard
      title={t('configsPage.b2bOverviewDialog.section.faq')}
      description={t('configsPage.b2bOverviewDialog.section.faqHelp')}
    >
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
      <FaqItemList items={value.items} onChange={(items) => onChange({ ...value, items })} locale={locale} />
    </SectionCard>
  )
}
