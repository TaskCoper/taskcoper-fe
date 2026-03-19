import TransactionsTable from '@/features/transactions/components/transactions-table'
import { useTranslation } from 'react-i18next'

export default function TransactionsPage() {
  const { t } = useTranslation()
  return (
    <div className='mx-auto p-6 space-y-6'>
      <div className='flex justify-between items-center gap-4'>
        <div>
          <p className='text-2xl font-bold tracking-tight'>{t('transactions.title')}</p>
          <p className='text-sm text-muted-foreground'>{t('transactions.description')}</p>
        </div>
      </div>

      <TransactionsTable />
    </div>
  )
}
