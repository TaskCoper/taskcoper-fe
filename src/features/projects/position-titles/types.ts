export interface ProjectPositionTitle {
  id: string
  name: string
  description: string | null
  color: string
}

export interface ProjectMemberPositionTitle extends ProjectPositionTitle {
  projectId: string
  memberCount: number
  createdOnUtc: string
  modifiedOnUtc: string
}
