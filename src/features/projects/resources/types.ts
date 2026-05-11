export interface ProjectResource {
  id: string
  name: string
  url: string
  isUpload: boolean
  thumbnailUrl: string | null
  mimeType: string
  bytes: number
  task: {
    id: string
    name: string
    isCompleted: boolean
    startDate: string
    endDate: string
    milestoneId: string
    milestoneName: string
    parentMilestoneId: string
    parentMilestoneName: string
    projectId: string
  } | null
  uploadBy: {
    id: string
    firstName: string
    lastName: string
    email: string
    avatar: string | null
  }
  createdOnUtc: string
  modifiedOnUtc: string | null
}
