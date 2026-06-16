import { useQuery } from '@tanstack/react-query'
import goongService from '../services/goong.service'

export const useGetLatLng = ({ address, enabled }: { address?: string; enabled?: boolean }) => {
  const { data: latLng, isLoading: isLoadingLatLng } = useQuery({
    queryKey: ['lat-lng', address],
    queryFn: () => goongService.getLatLngFromAddress({ address }),
    enabled: enabled && !!address
  })

  return { latLng, isLoadingLatLng }
}
