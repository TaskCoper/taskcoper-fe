import { queryKeys } from '@/lib/query-keys'
import mapService from '@/services/map.service'
import { useQuery } from '@tanstack/react-query'

export const useGetWards = (provinceCode: number) => {
  const { data: wards = [], isLoading: isLoadingWards } = useQuery({
    queryKey: queryKeys.location.wards(String(provinceCode)),
    queryFn: () => mapService.getWards(provinceCode),
    enabled: provinceCode !== -1
  })

  return { wards, isLoadingWards }
}
