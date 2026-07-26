import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { OrdersTable } from '../features/orders/components/orders-table'

export default function OrdersPage() {
  const { t } = useTenantTranslation()

  return (
    <div className='h-full overflow-auto'>
      <div className='space-y-6 p-6'>
        <div className='flex items-center justify-between gap-4'>
          <div>
            <p className='text-2xl font-bold'>{t('orders.list.title')}</p>
            <p className='text-sm text-muted-foreground'>{t('orders.list.description')}</p>
          </div>
        </div>

        <OrdersTable />
      </div>
    </div>
  )
}
