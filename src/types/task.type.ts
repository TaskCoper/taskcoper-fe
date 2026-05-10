import type { TaskPreview } from '@/features/projects/core/types'

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
