export interface Task {
  id: string
  name: string
  milestoneId: string
  position: number
  startDate: string | null
  endDate: string | null
  members: string[]
  totalSubtasks: number
  completedSubtasks: number
  totalComments: number
  totalResources: number
  progressPercentage: number
}

export type TaskCardType = 'TaskCard'

export interface TaskCardDragData {
  type: TaskCardType
  task: Task
}
