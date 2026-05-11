import type { TaskPreview } from '@/features/projects/core/types'
import type { TaskLabel } from '@/features/projects/tasks/labels/types'
import type { MentionUser } from '@/features/users/types'
import type { Milestone } from '@/types/milestone.type'
import type { TaskMember } from '../members/types'

export type TaskCardType = 'TaskCard'

export interface TaskCardDragData {
  type: TaskCardType
  task: TaskPreview
}

export interface MilestoneTask {
  id: string
  name: string
  position: number
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

export interface TaskDetail {
  taskId: string
  taskSlug: string
  taskName: string
  milestoneId: string
  milestoneName: string
  milestoneSlug: string
  parentMilestoneId: string
  parentMilestoneSlug: string
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
