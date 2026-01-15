import mapService from '@/services/map.service'
import { useQuery } from '@tanstack/react-query'

export const useGetWards = (provinceCode: number) => {
  const { data: wards = [], isLoading: isLoadingWards } = useQuery({
    queryKey: ['wards', provinceCode],
    queryFn: () => mapService.getWards(provinceCode),
    enabled: provinceCode !== -1
  })

  return { wards, isLoadingWards }
}
