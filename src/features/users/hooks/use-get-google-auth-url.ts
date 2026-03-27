import { queryKeys } from '@/lib/query-keys'
import { useAuthStore } from '@/lib/zustand/auth.store'
import googleService from '@/services/google.service'
import { useQuery } from '@tanstack/react-query'

export const useGetGoogleAuthUrl = () => {
  const { user } = useAuthStore()

  const { isFetching: isGettingGoogleAuthUrl, refetch } = useQuery({
    queryKey: queryKeys.users.googleAuthUrl(user?.UserId),
    queryFn: () => googleService.getGoogleAuthUrl(),
    enabled: false
  })

  const getGoogleAuthUrl = async () => {
    if (!user?.UserId) return undefined

    const { data } = await refetch()
    return data
  }

  return { getGoogleAuthUrl, isGettingGoogleAuthUrl }
}
