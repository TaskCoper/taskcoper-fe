export interface AuditLogActor {
  id: string
  firstName: string
  lastName: string
  email: string
  avatar: string | null
}

export interface AuditLog {
  id: string
  occurredOnUtc: string
  action: string
  entityType: string
  entityId: string
  previousJson: string | null
  nextJson: string | null
  reason: string | null
  actor: AuditLogActor | null
}
