import { queryKeys } from '@/lib/query-keys'
import userService from '@/services/user.service'
import { useQuery } from '@tanstack/react-query'
import { isAxiosError } from 'axios'

export const useGetMe = () => {
  const {
    data: me,
    isLoading: isGettingMe,
    isError
  } = useQuery({
    queryKey: queryKeys.auth.me(),
    queryFn: async () => {
      try {
        return await userService.getMe()
      } catch (error) {
        if (isAxiosError(error) && error.response?.status === 401) {
          return null
        }

        throw error
      }
    },
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
