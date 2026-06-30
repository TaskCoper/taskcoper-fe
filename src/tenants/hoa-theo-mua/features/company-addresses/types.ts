export interface CompanyAddress {
  id: string
  fullName: string
  phone: string
  remarks: string
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
