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
