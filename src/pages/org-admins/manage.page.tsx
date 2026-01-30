import NavUser from '@/components/sidebar/users/nav-user'
import { Skeleton } from '@/components/ui/skeleton'
import { useGetMe } from '@/features/auth/hooks/use-get-me'

export default function ManagePage() {
  const { me, isGettingMe } = useGetMe()

  return (
    <div className='p-4 flex items-center gap-4'>
      {isGettingMe ? <Skeleton className='size-8 rounded-full' /> : <NavUser user={me} />}
      <p className='text-lg font-semibold'>Org Admin Page</p>
    </div>
  )
}
