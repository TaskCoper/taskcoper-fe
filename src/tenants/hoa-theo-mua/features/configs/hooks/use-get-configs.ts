import { useQuery } from '@tanstack/react-query'
import { configKeys } from '../query-keys'
import configService from '../services'

export const useGetConfigs = () => {
  const { data: configs, isLoading: isGettingConfigs } = useQuery({
    queryKey: configKeys.all,
    queryFn: configService.getConfigs
  })

  return { configs, isGettingConfigs }
}
