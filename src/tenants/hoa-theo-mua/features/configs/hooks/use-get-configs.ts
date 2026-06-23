import { useQuery } from '@tanstack/react-query'
import configService from '../services'

export const useGetConfigs = () => {
  const { data: configs, isLoading: isGettingConfigs } = useQuery({
    queryKey: ['configs'],
    queryFn: configService.getConfigs
  })

  return { configs, isGettingConfigs }
}
