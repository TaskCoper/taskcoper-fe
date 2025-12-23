import { Spinner } from '@/components/ui/spinner'
import { useGetMe } from '@/features/auth/hooks/use-get-me'
import { useAuthStore } from '@/lib/zustand/auth.store'
import { Navigate, Outlet } from 'react-router'

interface GuardLayoutProps {
  requiresAuth: boolean
}

export default function GuardLayout({ requiresAuth }: GuardLayoutProps) {
  const { isAuthenticated } = useAuthStore()
  const { me, isMeLoading } = useGetMe(isAuthenticated)

  if (isAuthenticated && isMeLoading) {
    return (
      <div className='h-screen flex items-center justify-center'>
        <Spinner />
      </div>
    )
  }

  if (requiresAuth) {
    // No valid session → redirect to login
    if (!isAuthenticated || !me) {
      return <Navigate to='/' replace />
    }

    // Valid user → show protected content
    return <Outlet />
  }

  // If user is already logged in → redirect to /projects
  if (isAuthenticated && me) {
    return <Navigate to='/projects' replace />
  }

  // Not logged in → show login/signup page
  return <Outlet />
}
