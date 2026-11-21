import { useGetMe } from '@/features/auth/hooks/use-get-me'
import { queryKeys } from '@/lib/query-keys'
import config from '@/shared/config'
import { HubConnectionBuilder, HubConnectionState, LogLevel } from '@microsoft/signalr'
import { useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'

// Must match the backend contract HubMethods.NotificationNotify (BR-NOTIF-001).
const NOTIFICATION_NOTIFY = 'NotificationNotify'

/**
 * Opens an authenticated SignalR connection to the session hub and refreshes the notification
 * bell (unread count + list) whenever the backend pushes a NotificationNotify event. Auth is
 * cookie-based, so withCredentials is required (BR-NOTIF-002 — the hub no longer accepts ?userId).
 * Mount once in the authenticated shell.
 */
export const useNotificationsRealtime = () => {
  const { isAuthenticated } = useGetMe()
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!isAuthenticated) return

    const connection = new HubConnectionBuilder()
      .withUrl(`${config.baseURL}/api/v1/hubs/session`, { withCredentials: true })
      .withAutomaticReconnect()
      .configureLogging(LogLevel.Warning)
      .build()

    connection.on(NOTIFICATION_NOTIFY, () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all })
    })

    connection.start().catch((error) => {
      // Realtime is an enhancement over polling — never surface a hard failure to the user.
      console.warn('Notifications hub connection failed; falling back to polling', error)
    })

    return () => {
      connection.off(NOTIFICATION_NOTIFY)
      if (connection.state !== HubConnectionState.Disconnected) {
        connection.stop().catch(() => {})
      }
    }
  }, [isAuthenticated, queryClient])
}
