import { useGetMe } from '@/features/auth/hooks/use-get-me'
import { queryKeys } from '@/lib/query-keys'
import googleService from '@/services/google.service'
import { useQuery } from '@tanstack/react-query'

export const useGetGoogleAuthUrl = () => {
  const { me: user } = useGetMe()

  const { isFetching: isGettingGoogleAuthUrl, refetch } = useQuery({
    queryKey: queryKeys.users.googleAuthUrl(user?.id),
    queryFn: () => googleService.getGoogleAuthUrl(),
    enabled: false
  })

  const getGoogleAuthUrl = async () => {
    if (!user?.id) return undefined

    const { data } = await refetch()
    return data
  }

  return { getGoogleAuthUrl, isGettingGoogleAuthUrl }
}
