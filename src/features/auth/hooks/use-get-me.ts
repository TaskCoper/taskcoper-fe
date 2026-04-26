import { queryKeys } from '@/lib/query-keys'
import userService from '@/services/user.service'
import { useQuery } from '@tanstack/react-query'

export const useGetMe = () => {
  const {
    data: me,
    isLoading: isGettingMe,
    isError
  } = useQuery({
    queryKey: queryKeys.auth.me(),
    queryFn: userService.getMe,
    retry: false,
    throwOnError: false
  })

  return {
    me,
    isGettingMe,
    isAuthenticated: !!me && !isError,
    isVerificationRequired: !!me && !me.isEmailVerified
  }
}
