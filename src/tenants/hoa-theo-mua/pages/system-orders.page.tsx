import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { SystemOrdersTable } from '../features/orders/components/system-orders-table'

export default function SystemOrdersPage() {
  const { t } = useTenantTranslation()

  return (
    <div className='h-full overflow-auto'>
      <div className='space-y-6 p-6'>
        <div className='flex items-center justify-between gap-4'>
          <div>
            <p className='text-2xl font-bold'>{t('systemOrders.list.title')}</p>
            <p className='text-sm text-muted-foreground'>{t('systemOrders.list.description')}</p>
          </div>
        </div>

        <SystemOrdersTable />
      </div>
    </div>
  )
}
