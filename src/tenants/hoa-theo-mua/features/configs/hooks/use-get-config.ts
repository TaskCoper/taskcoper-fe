import { useQuery } from '@tanstack/react-query'
import configService from '../services'

export const useGetConfig = ({ id }: { id?: string }) => {
  const { data: config, isLoading: isGettingConfig } = useQuery({
    queryKey: ['config', id],
    queryFn: () => configService.getConfig({ id: id! }),
    enabled: !!id
  })

  return { config, isGettingConfig }
}
