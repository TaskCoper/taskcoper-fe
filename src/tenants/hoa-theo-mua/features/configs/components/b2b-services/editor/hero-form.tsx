import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import type { OverviewHero } from '../../../b2b-overview-palette'
import { ImageUploadField, LocalizedField } from '../b2b-section-editors'
import type { PreviewLocale } from '../preview/preview-shared'
import { SectionCard } from './editor-shared'

export function HeroForm({
  value,
  onChange,
  locale
}: {
  value: OverviewHero
  onChange: (next: OverviewHero) => void
  locale: PreviewLocale
}) {
  const { t } = useTenantTranslation()

  return (
    <SectionCard title={t('configsPage.b2bOverviewDialog.section.hero')}>
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
        label={t('configsPage.b2bOverviewDialog.field.subtitle')}
        value={value.subtitle}
        onChange={(subtitle) => onChange({ ...value, subtitle })}
        textarea
        locale={locale}
      />
      <LocalizedField
        label={t('configsPage.b2bOverviewDialog.field.audienceLine')}
        value={value.audienceLine}
        onChange={(audienceLine) => onChange({ ...value, audienceLine })}
        textarea
        locale={locale}
      />
      <LocalizedField
        label={t('configsPage.b2bOverviewDialog.field.primaryCta')}
        value={value.primaryCta}
        onChange={(primaryCta) => onChange({ ...value, primaryCta })}
        locale={locale}
      />
      <LocalizedField
        label={t('configsPage.b2bOverviewDialog.field.secondaryCta')}
        value={value.secondaryCta}
        onChange={(secondaryCta) => onChange({ ...value, secondaryCta })}
        locale={locale}
      />
      <ImageUploadField
        label={t('configsPage.b2bOverviewDialog.field.heroImage')}
        value={value.image}
        onChange={(image) => onChange({ ...value, image })}
      />
      <LocalizedField
        label={t('configsPage.b2bOverviewDialog.field.imageAlt')}
        value={value.imageAlt}
        onChange={(imageAlt) => onChange({ ...value, imageAlt })}
        locale={locale}
      />
    </SectionCard>
  )
}
