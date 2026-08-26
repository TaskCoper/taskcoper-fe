import axios from 'axios'

export interface VietmapBoundary {
  type: number
  id: number
  name: string
  prefix: string
  full_name: string
}

export interface VietmapSearchResult {
  ref_id: string
  distance: number
  address: string
  name: string
  display: string
  boundaries: VietmapBoundary[]
  categories: string[]
  entry_points: unknown[]
  data_new: Omit<VietmapSearchResult, 'data_new' | 'data_old'> | null
  data_old: Omit<VietmapSearchResult, 'data_new' | 'data_old'> | null
}

export interface VietmapReverseResult {
  ref_id: string
  name: string
  address: string
  display: string
  boundaries: VietmapBoundary[]
}

export interface VietmapPlaceDetail {
  display: string
  name: string
  hs_num: string
  street: string
  address: string
  city_id: number
  city: string
  district_id: number
  district: string
  ward_id: number
  ward: string
  lat: number
  lng: number
}

const normalizeAddress = (value: string): string => {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim()
}

// Strip admin prefixes so "Sài Gòn" matches "Phường Sài Gòn".
const ADMIN_PREFIX = /^(phuong|xa|thi tran|quan|huyen|thi xa|thanh pho|tinh)\s+/

const adminCoreName = (value: string): string => normalizeAddress(value).replace(ADMIN_PREFIX, '').trim()

// Prefer structured boundaries over free-text addresses, which may omit or abbreviate admin levels.
const boundaryMatchesCore = (boundaries: VietmapBoundary[], core: string): boolean =>
  boundaries.some((boundary) => {
    const name = adminCoreName(boundary.name)
    const fullName = adminCoreName(boundary.full_name)

    return name === core || fullName === core || name.includes(core) || fullName.includes(core)
  })

class VietmapService {
  autocompleteAddress = async ({
    text,
    focus,
    ward,
    city
  }: {
    text?: string
    focus?: string
    ward?: string
    city?: string
  }): Promise<VietmapSearchResult[]> => {
    if (!text || text.trim().length < 2) return []

    const { data } = await axios.get<VietmapSearchResult[]>('https://maps.vietmap.vn/api/autocomplete/v4', {
      // Search only the typed text; selected ward/city are enforced below.
      params: {
        text: text.trim(),
        focus,
        apikey: import.meta.env.VITE_VIETMAP_API_KEY,
        // Keep VietMap aligned with our 2-level ward/city shipping data.
        display_type: 1
      }
    })

    const wardCore = ward ? adminCoreName(ward) : null
    const cityCore = city ? adminCoreName(city) : null

    if (!wardCore && !cityCore) return data

    // VietMap only biases autocomplete by query, so hard-filter known admin boundaries.
    return data.filter((result) => {
      const boundaries = result.boundaries ?? []

      return (
        (!wardCore || boundaryMatchesCore(boundaries, wardCore)) &&
        (!cityCore || boundaryMatchesCore(boundaries, cityCore))
      )
    })
  }

  getPlaceDetail = async ({ refId }: { refId?: string }) => {
    const { data } = await axios.get<VietmapPlaceDetail>('https://maps.vietmap.vn/api/place/v4', {
      params: {
        refid: refId,
        apikey: import.meta.env.VITE_VIETMAP_API_KEY
      }
    })

    return data
  }

  reverseGeocode = async ({ lat, lng }: { lat: number; lng: number }): Promise<VietmapReverseResult[]> => {
    const { data } = await axios.get<VietmapReverseResult[]>('https://maps.vietmap.vn/api/reverse/v4', {
      params: {
        lat,
        lng,
        apikey: import.meta.env.VITE_VIETMAP_API_KEY,
        display_type: 1
      }
    })

    return data
  }
}

const vietmapService = new VietmapService()

export default vietmapService
