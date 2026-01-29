import type { TaskLabel } from './label.type'

export interface TaskPreview {
  id: string
  name: string
  milestoneId: string
  position: number
  startDate: string | null
  endDate: string | null
  members: TaskMember[]
  totalSubtasks: number
  completedSubtasks: number
  totalComments: number
  totalResources: number
  progressPercentage: number
  taskLabels: TaskLabel[]
  isCompleted: boolean
}

export type TaskCardType = 'TaskCard'

export interface TaskCardDragData {
  type: TaskCardType
  task: TaskPreview
}

export interface TaskDetail {
  taskId: string
  taskName: string
  milestoneId: string
  milestoneName: string
  taskDescription: string | null
  taskPosition: number
  taskStartDate: string | null
  taskEndDate: string | null
  announceBeforeMinutes: number | null
  backgroundImage: string | null
  estimatedPoints: number | null
  taskLabels: TaskLabel[]
  isCompleted: boolean
}

export interface TaskMember {
  userId: string
  firstName: string
  lastName: string
  email: string
  avatar: string | null
}
