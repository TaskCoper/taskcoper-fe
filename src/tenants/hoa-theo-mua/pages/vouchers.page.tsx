import VouchersEditor from '../features/vouchers/components/vouchers-editor'
import { DirtyRegistryProvider } from '../features/configs/state/dirty-registry'
import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'

type VouchersPageProps = {
  view?: 'vouchers' | 'programs'
}

export default function VouchersPage({ view = 'vouchers' }: VouchersPageProps) {
  const { t } = useTenantTranslation()

  return (
    <div className='flex h-full min-h-0 flex-col overflow-y-auto'>
      <DirtyRegistryProvider>
        <div className='flex min-h-full flex-1 flex-col gap-6 p-6'>
          <div>
            <h1 className='text-2xl font-bold'>
              {t(view === 'programs' ? 'configsPage.vouchers.programs' : 'configsPage.vouchers.list')}
            </h1>
            <p className='text-sm text-muted-foreground'>
              {t(
                view === 'programs' ? 'configsPage.vouchers.programDescription' : 'configsPage.vouchers.listDescription'
              )}
            </p>
          </div>
          <VouchersEditor view={view} />
        </div>
      </DirtyRegistryProvider>
    </div>
  )
}
