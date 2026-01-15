import mapService from '@/services/map.service'
import { useQuery } from '@tanstack/react-query'

export const useGetProvinces = () => {
  const { data: provinces = [], isLoading: isLoadingProvinces } = useQuery({
    queryKey: ['provinces'],
    queryFn: mapService.getProvinces
  })

  return { provinces, isLoadingProvinces }
}
