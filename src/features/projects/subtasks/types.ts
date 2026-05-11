import type { Subtask } from './shared-types'

export interface SubtaskWithChildren extends Subtask {
  children: Subtask[]
}

export interface ParentSubtaskDragData {
  type: 'ParentSubtask'
  subtask: SubtaskWithChildren
}

export interface ChildSubtaskDragData {
  type: 'ChildSubtask'
  subtask: Subtask
}
