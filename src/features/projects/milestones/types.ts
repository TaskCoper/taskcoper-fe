export interface Milestone {
  id: string
  name: string
  position: number
  slug: string
}

export interface ChildMilestone {
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
