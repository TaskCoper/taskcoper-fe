import type { Task } from './task.type'

export interface Milestone {
  id: string
  name: string
  position: number
}

export interface ParentMilestone {
  id: string
  name: string
  position: number
}

export type MilestoneColumnType = 'MilestoneColumn'

export interface MilestoneColumnDragData {
  type: MilestoneColumnType
  column: Milestone
}

export type MilestoneTabType = 'MilestoneTab'

export interface MilestoneTabDragData {
  type: MilestoneTabType
  milestone: Milestone
}

export interface MilestoneWithTasks {
  parentId: string
  milestones: Milestone[]
  tasks: Task[]
}
