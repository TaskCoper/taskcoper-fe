import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import type { OverviewCta } from '../../../b2b-overview-palette'
import { LocalizedField } from '../b2b-section-editors'
import type { PreviewLocale } from '../preview/preview-shared'
import { SectionCard } from './editor-shared'

export function CtaForm({
  value,
  onChange,
  locale
}: {
  value: OverviewCta
  onChange: (next: OverviewCta) => void
  locale: PreviewLocale
}) {
  const { t } = useTenantTranslation()

  return (
    <SectionCard title={t('configsPage.b2bOverviewDialog.section.cta')}>
      <LocalizedField
        label={t('configsPage.b2bOverviewDialog.field.eyebrow')}
        value={value.eyebrow}
        onChange={(eyebrow) => onChange({ ...value, eyebrow })}
        locale={locale}
      />
      <LocalizedField
        label={t('configsPage.b2bOverviewDialog.field.subEyebrow')}
        value={value.subEyebrow}
        onChange={(subEyebrow) => onChange({ ...value, subEyebrow })}
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
      <div className='grid grid-cols-1 gap-3 md:grid-cols-2'>
        <LocalizedField
          label={t('configsPage.b2bOverviewDialog.field.callLabel')}
          value={value.callLabel}
          onChange={(callLabel) => onChange({ ...value, callLabel })}
          locale={locale}
        />
        <LocalizedField
          label={t('configsPage.b2bOverviewDialog.field.emailLabel')}
          value={value.emailLabel}
          onChange={(emailLabel) => onChange({ ...value, emailLabel })}
          locale={locale}
        />
        <LocalizedField
          label={t('configsPage.b2bOverviewDialog.field.primary')}
          value={value.primary}
          onChange={(primary) => onChange({ ...value, primary })}
          locale={locale}
        />
        <LocalizedField
          label={t('configsPage.b2bOverviewDialog.field.secondary')}
          value={value.secondary}
          onChange={(secondary) => onChange({ ...value, secondary })}
          locale={locale}
        />
      </div>
    </SectionCard>
  )
}
