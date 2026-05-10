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

export interface ProjectTopContributor {
  userId: string
  email: string
  firstName: string
  lastName: string
  avatar: string | null
  contributionPercentage: number
  totalWeightedScore: number
  totalTaskCompleted: number
}
