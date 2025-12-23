import userService from '@/services/user.service'
import { useQuery } from '@tanstack/react-query'

export const useGetMe = (enabled: boolean) => {
  const { data: me, isLoading: isMeLoading } = useQuery({
    queryKey: ['me'],
    queryFn: userService.getMe,
    enabled
  })

  return { me, isMeLoading }
}
