import { useGetMe } from '@/features/auth/hooks/use-get-me'
import { queryKeys } from '@/lib/query-keys'
import notificationService from '@/services/notification.service'
import { useQuery } from '@tanstack/react-query'

interface UseGetUnreadCountOptions {
  enabled?: boolean
}

export const useGetUnreadCount = ({ enabled = true }: UseGetUnreadCountOptions = {}) => {
  const { me: user, isAuthenticated } = useGetMe()

  const {
    data: unreadCount = 0,
    isLoading: isLoadingUnreadCount,
    error
  } = useQuery({
    queryKey: queryKeys.notifications.unreadCount.byUser(user?.id),
    queryFn: () => notificationService.getUnreadCount(),
    enabled: enabled && isAuthenticated
  })

  return { unreadCount, isLoadingUnreadCount, error }
}
