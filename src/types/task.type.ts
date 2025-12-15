import type { ColumnId } from '@/features/projects/components/project-board'
import type { UniqueIdentifier } from '@dnd-kit/core'

export interface TaskEntity {
  // TODO: Add actual DB fields when backend is ready
  id: string
  content: string
  milestoneId: string
}

export interface TaskCardVM {
  id: UniqueIdentifier
  columnId: ColumnId
  content: string
}

export type TaskCardType = 'TaskCard'

export interface TaskCardDragData {
  type: TaskCardType
  task: TaskCardVM
}
