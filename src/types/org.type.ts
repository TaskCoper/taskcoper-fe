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
