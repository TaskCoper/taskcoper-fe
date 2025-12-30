import { useAuthStore } from '@/lib/zustand/auth.store'
import notificationService from '@/services/notification.service'
import { DEFAULT_PAGE_INDEX, DEFAULT_PAGE_SIZE } from '@/shared/constants'
import { getDefaultPaginationResponse } from '@/shared/utils'
import type { Notification } from '@/types/notification.type'
import { useQuery } from '@tanstack/react-query'

export interface GetMyNotificationsParams {
  pageIndex?: number
  pageSize?: number
}

export const useGetMyNotifications = ({
  pageIndex = DEFAULT_PAGE_INDEX,
  pageSize = DEFAULT_PAGE_SIZE
}: GetMyNotificationsParams) => {
  const { user } = useAuthStore()

  const {
    data: notifications = { ...getDefaultPaginationResponse<Notification>() },
    isLoading: isLoadingNotifications,
    error
  } = useQuery({
    queryKey: ['notifications', user?.UserId, pageIndex, pageSize],
    queryFn: () => notificationService.getMyNotifications({ pageIndex, pageSize })
  })

  return { notifications, isLoadingNotifications, error }
}
