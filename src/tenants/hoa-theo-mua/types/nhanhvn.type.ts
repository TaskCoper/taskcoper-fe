export interface Depot {
  id: number
  code: string
  name: string
  mobile: string
  location: {
    cityId: number
    cityName: string
    districtId: number
    districtName: string
    wardId: number
    wardName: string
    address: string
  }
  locationV2: {
    cityId: number
    cityName: string | null
    wardId: number
    wardName: string | null
    address: string
  }
}

export interface OrderTag {
  id: number
  businessId: number
  name: string
  status: number
  bgColor: string | null
  textColor: string
  createdAt: number
}

export interface ProductLabel {
  id: number
  businessId: number
  name: string
  status: number
  bgColor: string | null
  textColor: string | null
  createdAt: number
}
