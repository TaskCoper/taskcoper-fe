import VouchersTable from '@/features/vouchers/components/vouchers-table'
import { useTranslation } from 'react-i18next'

export default function MentorVouchersPage() {
  const { t } = useTranslation()

  return (
    <div className='absolute inset-0 overflow-y-auto overflow-x-hidden'>
      <div className='min-w-0 space-y-6 p-6'>
        <div>
          <p className='text-xl font-bold'>{t('voucher.page.title')}</p>
          <p className='text-sm text-muted-foreground'>{t('voucher.page.description')}</p>
        </div>

        <VouchersTable />
      </div>
    </div>
  )
}
