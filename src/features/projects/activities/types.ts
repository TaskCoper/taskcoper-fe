export interface ProjectActivityActor {
  id: string
  firstName: string
  lastName: string
  email: string
  avatar: string | null
}

export interface ProjectActivity {
  id: string
  occurredOnUtc: string
  verb: string
  objectType: string
  objectId: string
  targetType: string | null
  targetId: string | null
  metadataJson: string | null
  actor: ProjectActivityActor
}
