import { useQuery } from '@tanstack/react-query'
import nhanhVNService from '../services/nhanhvn.service'

export const useGetDepots = () => {
  const { data: depots = [], isLoading: isLoadingDepots } = useQuery({
    queryKey: ['depots'],
    queryFn: nhanhVNService.getDepots
  })

  return { depots, isLoadingDepots }
}
