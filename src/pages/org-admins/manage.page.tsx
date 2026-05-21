import NavUser from '@/components/nav-user'
import { Skeleton } from '@/components/ui/skeleton'
import { useGetMe } from '@/features/auth/hooks/use-get-me'
import { useTranslation } from 'react-i18next'

export default function ManagePage() {
  const { t } = useTranslation()
  const { me, isGettingMe } = useGetMe()

  return (
    <div className='p-4 flex items-center gap-4'>
      {isGettingMe ? <Skeleton className='size-8 rounded-full' /> : <NavUser user={me} />}
      <p className='text-lg font-semibold'>{t('admin.page.org')}</p>
    </div>
  )
}
