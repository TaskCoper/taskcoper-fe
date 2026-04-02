import RedemptionsTable from '@/features/vouchers/components/redemptions-table'
import { useTranslation } from 'react-i18next'

interface RedemptionsTabProps {
  voucherId: string
}

export default function RedemptionsTab({ voucherId }: RedemptionsTabProps) {
  const { t } = useTranslation()

  return (
    <div className='grow space-y-6'>
      <div>
        <p className='text-xl font-bold'>{t('voucher.page.redemptionsTitle')}</p>
        <p className='text-sm text-muted-foreground'>{t('voucher.page.redemptionsDescription')}</p>
      </div>

      <RedemptionsTable voucherId={voucherId} />
    </div>
  )
}
