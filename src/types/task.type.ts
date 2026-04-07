import type { TaskLabel } from './label.type'
import type { Milestone } from './milestone.type'
import type { MentionUser } from './user.type'

export interface TaskPreview {
  id: string
  name: string
  milestoneId: string
  slug: string
  position: number
  startDate: string | null
  endDate: string | null
  priority: TaskPriority | null
  members: TaskMember[]
  totalSubtasks: number
  hasDescription: boolean
  completedSubtasks: number
  totalComments: number
  totalResources: number
  progressPercentage: number
  taskLabels: TaskLabel[]
  isCompleted: boolean
  estimatedPoints: number | null
  backgroundImage: string | null
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
  priority: TaskPriority | null
  taskStartDate: string | null
  taskEndDate: string | null
  announceBeforeMinutes: number | null
  backgroundImage: string | null
  estimatedPoints: number | null
  taskLabels: TaskLabel[]
  isCompleted: boolean
  mentionedUsers: MentionUser[]
}

export interface TaskRow {
  id: string
  name: string
  position: number
  estimatedPoints: number | null
  backgroundImage: string | null
  isCompleted: boolean
  priority: TaskPriority | null
  startDate: string | null
  endDate: string | null
  members: TaskMember[]
  totalSubtasks: number
  completedSubtasks: number
  totalComments: number
  totalResources: number
  progressPercentage: number
  taskLabels: TaskLabel[]
  milestone: Milestone
}

export interface TaskMember {
  userId: string
  firstName: string
  lastName: string
  email: string
  avatar: string | null
  isMemberInTask: boolean
}

export interface MilestoneTask {
  id: string
  name: string
  position: number
}

export interface TaskStatusStats {
  isCompleted: boolean
  totalTasks: number
}

export const TaskPriority = {
  HIGHEST: 'HIGHEST',
  HIGH: 'HIGH',
  MEDIUM: 'MEDIUM',
  LOW: 'LOW',
  LOWEST: 'LOWEST'
} as const

export type TaskPriority = (typeof TaskPriority)[keyof typeof TaskPriority]

export const TaskPriorityLabel = {
  [TaskPriority.LOWEST]: 'task.priority.lowest',
  [TaskPriority.LOW]: 'task.priority.low',
  [TaskPriority.MEDIUM]: 'task.priority.medium',
  [TaskPriority.HIGH]: 'task.priority.high',
  [TaskPriority.HIGHEST]: 'task.priority.highest'
} as const

export type TaskPriorityLabel = (typeof TaskPriorityLabel)[keyof typeof TaskPriorityLabel]
