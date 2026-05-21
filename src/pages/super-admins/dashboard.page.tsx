import { useTranslation } from 'react-i18next'

export default function DashboardPage() {
  const { t } = useTranslation()

  return (
    <div className='p-4 flex items-center gap-4'>
      <p className='text-lg font-semibold'>{t('admin.page.super')}</p>
    </div>
  )
}
