import { useQuery } from '@tanstack/react-query'
import configService from '../services'
import type { GetConfigsParams } from '../types'

interface GetSecretConfigsProps extends GetConfigsParams {
  enabled?: boolean
}

export const useGetSecretConfigs = ({ groupName, key, enabled = true }: GetSecretConfigsProps) => {
  const { data: secretConfigs, isLoading: isGettingSecretConfigs } = useQuery({
    queryKey: ['configs', 'secret', groupName, key],
    queryFn: () => configService.getSecretConfigs({ groupName, key }),
    enabled
  })

  return { secretConfigs, isGettingSecretConfigs }
}
