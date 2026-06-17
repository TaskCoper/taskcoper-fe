import axios from 'axios'

export interface GeoResponse {
  plus_code: PlusCodeRoot
  results: GeoResult[]
  status: string
}

export interface PlusCodeRoot {
  compound_code?: string
  global_code?: string
}

export interface GeoResult {
  address_components: AddressComponent[]
  formatted_address: string
  geometry: Geometry
  place_id: string
  reference: string
  plus_code: PlusCode
  types: string[]
}

export interface AddressComponent {
  long_name: string
  short_name: string
}

export interface Geometry {
  location: Location
}

export interface Location {
  lat: number
  lng: number
}

export interface PlusCode {
  compound_code: string
  global_code: string
}

const normalizeAddress = (value: string): string => {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim()
}

export const pickBestGeocodeResult = (inputAddress: string, response?: GeoResponse): GeoResult | null => {
  if (!response || response.status !== 'OK' || response.results.length === 0) {
    return null
  }

  const normalizedInput = normalizeAddress(inputAddress)

  const exactMatch = response.results.find((result) => {
    const normalizedFormattedAddress = normalizeAddress(result.formatted_address)
    return normalizedFormattedAddress === normalizedInput
  })

  if (exactMatch) {
    return exactMatch
  }

  // Fallback: geocoding APIs usually return best result first
  return response.results[0]
}

class GoongService {
  getLatLngFromAddress = async ({ address }: { address?: string }) => {
    const { data } = await axios.get<GeoResponse>('https://rsapi.goong.io/geocode', {
      params: { address, api_key: import.meta.env.VITE_GOONG_MAP_API_KEY }
    })

    return data
  }
}

const goongService = new GoongService()
export default goongService
