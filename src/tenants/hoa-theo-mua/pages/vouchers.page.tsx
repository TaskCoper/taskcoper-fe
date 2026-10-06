import VouchersEditor from '../features/configs/components/promotions/vouchers-editor'
import { DirtyRegistryProvider } from '../features/configs/state/dirty-registry'
import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'

export default function VouchersPage() {
  const { t } = useTenantTranslation()

  return (
    <div className='flex h-full min-h-0 flex-col overflow-y-auto'>
      <DirtyRegistryProvider>
        <div className='flex min-h-full flex-1 flex-col gap-6 p-6'>
          <div>
            <h1 className='text-2xl font-bold'>{t('configsPage.vouchers.title')}</h1>
            <p className='text-sm text-muted-foreground'>{t('configsPage.vouchers.pageDescription')}</p>
          </div>
          <VouchersEditor />
        </div>
      </DirtyRegistryProvider>
    </div>
  )
}
