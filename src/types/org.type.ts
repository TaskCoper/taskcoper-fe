export interface Organization {
  id: string
  name: string
  contactEmail: string
  contactAddress: string
  contactCity: string
  contactState: string
  contactCountry: string
  createdOnUtc: string
  modifiedOnUtc: string | null
}
