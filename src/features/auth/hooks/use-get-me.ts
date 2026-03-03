import { queryKeys } from '@/lib/query-keys'
import { useAuthStore } from '@/lib/zustand/auth.store'
import userService from '@/services/user.service'
import { useQuery } from '@tanstack/react-query'

export const useGetMe = () => {
  const { isAuthenticated, user: jwtUser } = useAuthStore()

  const isVerified = jwtUser?.IsVerified === 'true'

  const { data: me, isLoading: isGettingMe } = useQuery({
    queryKey: queryKeys.auth.me(),
    queryFn: userService.getMe,
    enabled: isAuthenticated && isVerified
  })

  return {
    me,
    isGettingMe: isAuthenticated && isVerified ? isGettingMe : false
  }
}
