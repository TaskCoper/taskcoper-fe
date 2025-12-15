import type { UniqueIdentifier } from '@dnd-kit/core'

export interface MilestoneEntity {
  // TODO: Add actual DB fields when backend is ready
  id: string
  title: string
}

export interface MilestoneColumnVM {
  id: UniqueIdentifier
  title: string
}

export type MilestoneColumnType = 'MilestoneColumn'

export interface MilestoneColumnDragData {
  type: MilestoneColumnType
  column: MilestoneColumnVM
}
