import VouchersTable from '@/features/vouchers/components/vouchers-table'
import { useTranslation } from 'react-i18next'

export default function MentorVouchersPage() {
  const { t } = useTranslation()

  return (
    <div className='p-6 space-y-6'>
      <div>
        <p className='text-xl font-bold'>{t('voucher.page.title')}</p>
        <p className='text-sm text-muted-foreground'>{t('voucher.page.description')}</p>
      </div>

      <VouchersTable />
    </div>
  )
}
