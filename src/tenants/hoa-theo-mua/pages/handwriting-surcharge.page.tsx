import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { PlaceholderPage } from '../components/placeholder-page'

export default function HandwritingSurchargePage() {
  const { t } = useTenantTranslation()

  return <PlaceholderPage titleKey={t('navigation.cardConfiguration.handwritingSurcharge')} />
}
