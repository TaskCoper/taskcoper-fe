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
}

export interface SubtaskWithChildren extends Subtask {
  children: Subtask[]
}
