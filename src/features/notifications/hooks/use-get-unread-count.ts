import { useAuthStore } from '@/lib/zustand/auth.store'
import notificationService from '@/services/notification.service'
import { useQuery } from '@tanstack/react-query'

export const useGetUnreadCount = () => {
  const { user } = useAuthStore()

  const {
    data: unreadCount = 0,
    isLoading: isLoadingUnreadCount,
    error
  } = useQuery({
    queryKey: ['unread-count', user?.UserId],
    queryFn: () => notificationService.getUnreadCount()
  })

  return { unreadCount, isLoadingUnreadCount, error }
}
