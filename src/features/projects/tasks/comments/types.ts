import type { MentionUser } from '@/types/user.type'

export interface Comment {
  commentId: string
  content: string
  isTaskLog: boolean
  userId: string
  firstName: string
  lastName: string
  avatar: string | null
  email: string
  createdAt: string
  updatedAt: string | null
  responses: []
  mentionedUsers: MentionUser[]
}
