export interface Subtask {
  id: string
  name: string
  isCompleted: boolean
  parentId: string | null
  index: number
  userDoneId: string | null
  userDoneAvatar: string | null
  userDoneFullName: string | null
  email: string | null
  completedAt: string | null
  deadline: string | null
  assignees: Array<{
    userId: string
    firstName: string
    lastName: string
    email: string
    avatar: string | null
  }>
}
