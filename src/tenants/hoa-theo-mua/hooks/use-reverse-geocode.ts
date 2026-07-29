import { useMutation } from '@tanstack/react-query'
import vietmapService from '../services/vietmap.service'

// Boundary levels in VietMap responses: 0 = city, 1 = district, 2 = ward.
const BOUNDARY_CITY = 0
const BOUNDARY_WARD = 2

export interface ReverseGeocodeResult {
  latitude: number
  longitude: number
  mapId: string
  addressLine: string
  ward: string
  city: string
}

export const useReverseGeocode = () => {
  const { mutateAsync: reverseGeocode, isPending: isReverseGeocoding } = useMutation({
    mutationFn: async ({ lat, lng }: { lat: number; lng: number }): Promise<ReverseGeocodeResult> => {
      const results = await vietmapService.reverseGeocode({ lat, lng })
      const first = results[0]

      if (!first) {
        return { latitude: lat, longitude: lng, mapId: '', addressLine: '', ward: '', city: '' }
      }

      const ward = first.boundaries.find((boundary) => boundary.type === BOUNDARY_WARD)?.full_name ?? ''
      const city = first.boundaries.find((boundary) => boundary.type === BOUNDARY_CITY)?.full_name ?? ''

      return {
        latitude: lat,
        longitude: lng,
        mapId: first.ref_id,
        addressLine: first.name || first.display || '',
        ward,
        city
      }
    }
  })

  return { reverseGeocode, isReverseGeocoding }
}
