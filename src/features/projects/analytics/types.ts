import type { TaskPriority } from '@/features/projects/tasks/core/types'
import type { RevenueType } from '../revenue/types'

export interface ProjectLabelStats {
  id: string
  projectId: string
  name: string
  color: string
  taskCount: number
  createdOnUtc: string
  modifiedOnUtc: string | null
}

export interface TaskStatusStats {
  isCompleted: boolean
  totalTasks: number
}

export interface ProjectMemberStats {
  userId: string
  firstName: string
  lastName: string
  email: string
  avatar: string | null
  totalTasks: number
}

export interface ProjectResourceStats {
  totalResources: number
  totalBytes: number
}

export interface ProjectMimeTypeStats {
  mimeType: string
  totalResources: number
}

export interface ProjectResourceMemberStats {
  id: string
  firstName: string
  lastName: string
  email: string
  avatar: string | null
  totalResources: number
}

export interface ProjectPriorityStats {
  priority: TaskPriority | null
  totalTasks: number
}

export interface RevenueStats {
  totalRevenue: number
  totalExpense: number
  netRevenue: number
}

export interface RevenueLabelStats {
  id: string
  name: string
  color: string
  transactionCount: number
}

export interface RevenueTypeStats {
  name: RevenueType
  transactionCount: number
}

export interface MilestoneStats {
  id: string
  name: string
  position: number
  taskCount: number
  completedTaskCount: number
}
