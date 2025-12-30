export const NotificationType = {
  Task: 'Task',
  Chat: 'Chat',
  Project: 'Project',
  System: 'System'
} as const

export type NotificationType = (typeof NotificationType)[keyof typeof NotificationType]

export const NotificationTypeLabel = {
  [NotificationType.Task]: 'notification.type.task',
  [NotificationType.Chat]: 'notification.type.chat',
  [NotificationType.Project]: 'notification.type.project',
  [NotificationType.System]: 'notification.type.system'
} as const

export type NotificationTypeLabel = (typeof NotificationTypeLabel)[keyof typeof NotificationTypeLabel]

export interface Notification {
  id: string
  userId: string
  notificationType: NotificationType
  title: string
  message: string
  isRead: boolean
  payloadJson: string
  createdAt: string
}
