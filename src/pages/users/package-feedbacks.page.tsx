import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useGetPurchasedMentorPackages } from '@/features/mentor-packages/hooks/use-get-purchased-mentor-packages'
import { format } from 'date-fns'
import { enUS, vi } from 'date-fns/locale'
import i18next from 'i18next'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

export default function PackageFeedbacksPage() {
  const locale = i18next.language === 'vi' ? vi : enUS
  const { t } = useTranslation()
  const { purchasedMentorPackages } = useGetPurchasedMentorPackages({ isNeedFeedback: true })
  const dateFormat = t('packageFeedback.list.dateFormat')

  return (
    <div className='max-w-7xl mx-auto p-6 space-y-8'>
      <div>
        <p className='text-2xl font-bold'>{t('packageFeedback.list.title')}</p>
        <p className='text-sm text-muted-foreground'>{t('packageFeedback.list.description')}</p>
      </div>

      <div className='border rounded-md'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className='w-10 text-center'>{t('packageFeedback.list.columns.index')}</TableHead>
              <TableHead>{t('packageFeedback.list.columns.packageName')}</TableHead>
              <TableHead>{t('packageFeedback.list.columns.mentor')}</TableHead>
              <TableHead>{t('packageFeedback.list.columns.project')}</TableHead>
              <TableHead>{t('packageFeedback.list.columns.purchasedAt')}</TableHead>
              <TableHead>{t('packageFeedback.list.columns.action')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {purchasedMentorPackages.value.items.map((pkg, index) => (
              <TableRow key={pkg.id}>
                <TableCell className='font-medium text-center'>{index + 1}</TableCell>
                <TableCell>{pkg.name}</TableCell>
                <TableCell>
                  {pkg.mentor.firstName} {pkg.mentor.lastName}
                </TableCell>
                <TableCell>{pkg.project?.name ?? t('packageFeedback.list.notAvailable')}</TableCell>
                <TableCell>{format(new Date(pkg.createdOnUtc), dateFormat, { locale })}</TableCell>
                <TableCell>
                  <Link
                    to={`/purchases/${pkg.packageBookingId}/feedback`}
                    className='hover:underline hover:text-primary'
                  >
                    {t('packageFeedback.list.giveFeedback')}
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
