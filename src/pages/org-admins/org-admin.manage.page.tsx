import { Skeleton } from '@/components/ui/skeleton'
import { useGetMe } from '@/features/auth/hooks/use-get-me'
import NavUser from '@/features/projects/components/sidebar/nav-user'

export default function OrgAdminManagePage() {
  const { me, isGettingMe } = useGetMe()

  return (
    <div className='p-4 flex items-center gap-4'>
      {isGettingMe ? <Skeleton className='size-8 rounded-full' /> : <NavUser user={me} />}
      <p className='text-lg font-semibold'>Org Admin Page</p>
    </div>
  )
}
