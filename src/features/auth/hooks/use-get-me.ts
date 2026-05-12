import userService from '@/features/users/services'
import { queryKeys } from '@/lib/query-keys'
import { useQuery } from '@tanstack/react-query'
import { isAxiosError } from 'axios'

interface UseGetMeOptions {
  enabled?: boolean
}

export const useGetMe = ({ enabled = true }: UseGetMeOptions = {}) => {
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
    throwOnError: false,
    enabled
  })

  return {
    me,
    isGettingMe,
    isAuthenticated: !!me && !isError,
    isVerificationRequired: !!me && me.isEmailVerified === false
  }
}
