import { queryKeys } from '@/lib/query-keys'
import userService from '@/services/user.service'
import { useQuery } from '@tanstack/react-query'

export const useGetUser = ({ userId }: { userId?: string }) => {
  const { data: user, isLoading: isGettingUser } = useQuery({
    queryKey: queryKeys.users.detail(userId),
    queryFn: () => userService.getUser({ userId: userId! }),
    enabled: !!userId
  })

  return { user, isGettingUser: userId ? isGettingUser : false }
}
