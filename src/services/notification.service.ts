import type { GetMyNotificationsParams } from '@/features/notifications/hooks/use-get-my-notifications'
import api, { type BasePaginationResponse, type BaseResponse } from '@/lib/axios'
import { NotificationMarkedType, type Notification } from '@/types/notification.type'

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

  getUnreadCount = async () => {
    const { data } = await api.get<BaseResponse<{ count: number }>>(`/v1/${this.baseUrl}/unread-count`)

    return data.value.count
  }

  readNotification = async ({
    notificationId,
    markedType
  }: {
    notificationId?: string
    markedType: NotificationMarkedType
  }) => {
    const url =
      markedType === NotificationMarkedType.Single
        ? `notificationId=${notificationId}&markedType=${markedType}`
        : `markedType=${markedType}`

    const { data } = await api.post<BaseResponse<string>>(`/v1/${this.baseUrl}/read?${url}`)

    return data.value
  }
}

const notificationService = new NotificationService()
export default notificationService
