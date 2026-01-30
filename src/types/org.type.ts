export interface Organization {
  id: string
  name: string
  contactEmail: string
  logo: string
  contactAddress: string
  contactCity: string
  contactState: string
  contactCountry: string
  createdOnUtc: string
  modifiedOnUtc: string | null
}

export interface OrganizationStats {
  organizationId: string
  organizationName: string
  totalProjects: number
  totalUsers: number
}
