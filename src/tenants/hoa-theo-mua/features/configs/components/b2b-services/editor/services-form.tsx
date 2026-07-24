import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import type { OverviewServices } from '../../../b2b-overview-palette'
import { LocalizedField } from '../b2b-section-editors'
import type { PreviewLocale } from '../preview/preview-shared'
import { SectionCard } from './editor-shared'

export function ServicesForm({
  value,
  onChange,
  locale
}: {
  value: OverviewServices
  onChange: (next: OverviewServices) => void
  locale: PreviewLocale
}) {
  const { t } = useTenantTranslation()

  return (
    <SectionCard
      title={t('configsPage.b2bOverviewDialog.section.services')}
      description={t('configsPage.b2bOverviewDialog.section.servicesHelp')}
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
      <LocalizedField
        label={t('configsPage.b2bOverviewDialog.field.explore')}
        value={value.explore}
        onChange={(explore) => onChange({ ...value, explore })}
        locale={locale}
      />
      <LocalizedField
        label={t('configsPage.b2bOverviewDialog.field.viewPackages')}
        value={value.viewPackages}
        onChange={(viewPackages) => onChange({ ...value, viewPackages })}
        locale={locale}
      />
    </SectionCard>
  )
}
