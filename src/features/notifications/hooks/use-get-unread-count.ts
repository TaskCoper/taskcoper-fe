import { useAuthStore } from '@/lib/zustand/auth.store'
import notificationService from '@/services/notification.service'
import { useQuery } from '@tanstack/react-query'

interface UseGetUnreadCountOptions {
  enabled?: boolean
}

export const useGetUnreadCount = ({ enabled = true }: UseGetUnreadCountOptions = {}) => {
  const { user } = useAuthStore()

  const {
    data: unreadCount = 0,
    isLoading: isLoadingUnreadCount,
    error
  } = useQuery({
    queryKey: ['unread-count', user?.UserId],
    queryFn: () => notificationService.getUnreadCount(),
    enabled
  })

  return { unreadCount, isLoadingUnreadCount, error }
}
