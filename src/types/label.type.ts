export interface Label {
  id: string
  projectId: string
  name: string
  color: string
  createdOnUtc: string
  modifiedOnUtc: string | null
}

export interface TaskLabel {
  id: string
  projectTaskLabelId: string
  name: string
  color: string
}

export interface ProjectLabelStats {
  id: string
  projectId: string
  name: string
  color: string
  taskCount: number
  createdOnUtc: string
  modifiedOnUtc: string | null
}

export interface RevenueLabel {
  id: string
  name: string
  color: string
}
