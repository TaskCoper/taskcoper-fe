export interface ProjectHeatmap {
  totalTasksCreated: number
  totalSubtasksCreated: number
  totalCommentsCreated: number
  totalFilesUploaded: number
  totalTasksCompleted: number
  statisticDate: string
}

export interface ProjectTaskStats {
  totalTasksCreated: number
  totalTaskCompleted: number
  startDate: string
  endDate: string
}
