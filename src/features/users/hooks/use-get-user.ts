import { queryKeys } from '@/lib/query-keys'
import { useQuery } from '@tanstack/react-query'
import userService from '../services'

export const useGetUser = ({ userIdentifier }: { userIdentifier?: string }) => {
  const { data: user, isLoading: isGettingUser } = useQuery({
    queryKey: queryKeys.users.detail(userIdentifier),
    queryFn: () => userService.getUser({ userIdentifier }),
    enabled: !!userIdentifier
  })

  return { user, isGettingUser }
}
