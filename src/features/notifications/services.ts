import type { BasePaginationResponse, BaseResponse } from '@/lib/axios'
import { BaseService } from '@/services/base.service'
import type { GetMyNotificationsParams } from './hooks/use-get-my-notifications'
import { NotificationMarkedType, type Notification } from './types'

class NotificationService extends BaseService {
  private readonly baseUrl = 'notifications'

  getMyNotifications = async ({ pageIndex, pageSize }: GetMyNotificationsParams) => {
    const { data } = await this.get<BasePaginationResponse<Notification>>(`/v1/${this.baseUrl}`, {
      params: {
        pageIndex,
        pageSize
      }
    })

    return data
  }

  getUnreadCount = async () => {
    const { data } = await this.get<BaseResponse<{ count: number }>>(`/v1/${this.baseUrl}/unread-count`)

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

    const { data } = await this.post<BaseResponse<string>>(`/v1/${this.baseUrl}/read?${url}`)

    return data.value
  }
}

const notificationService = new NotificationService()
export default notificationService
