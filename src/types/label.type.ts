export interface Label {
  id: string
  projectSlug: string
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

export interface RevenueLabel {
  id: string
  name: string
  color: string
}
