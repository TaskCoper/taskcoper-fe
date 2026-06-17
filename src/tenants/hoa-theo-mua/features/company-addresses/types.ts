export interface CompanyAddress {
  id: string
  addressLine: string
  ward: string
  city: string
  country: string
  latitude: number
  longitude: number
  mapId: string
  createdAt: string
  updatedAt: string | null
}
