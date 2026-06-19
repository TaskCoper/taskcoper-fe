import { useQuery } from '@tanstack/react-query'
import orderService from '../services'
import type { ShippingLocationType } from '../types'

interface UseGetShippingLocationsParams {
  type: ShippingLocationType
  parentId?: number
  enabled?: boolean
}

export const useGetShippingLocations = ({ type, parentId, enabled = true }: UseGetShippingLocationsParams) => {
  const { data: shippingLocations = [], isLoading: isLoadingShippingLocations } = useQuery({
    queryKey: ['shipping-locations', type, parentId ?? null],
    queryFn: () => orderService.getOrderShippingLocations({ locationVersion: 'v2', type, parentId }),
    enabled
  })

  return { shippingLocations, isLoadingShippingLocations }
}
