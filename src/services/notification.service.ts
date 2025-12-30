import type { GetMyNotificationsParams } from '@/features/notifications/hooks/use-get-my-notifications'
import api, { type BasePaginationResponse } from '@/lib/axios'
import type { Notification } from '@/types/notification.type'

class NotificationService {
  private readonly baseUrl = 'notifications'

  getMyNotifications = async ({ pageIndex, pageSize }: GetMyNotificationsParams) => {
    const { data } = await api.get<BasePaginationResponse<Notification>>(`/v1/${this.baseUrl}`, {
      params: {
        pageIndex,
        pageSize
      }
    })

    return data
  }
}

const notificationService = new NotificationService()
export default notificationService
