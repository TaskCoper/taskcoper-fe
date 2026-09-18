import { useQuery } from '@tanstack/react-query'
import { configKeys } from '../query-keys'
import configService from '../services'
import { ConfigKind, type GetConfigsParams } from '../types'

interface GetSecretConfigsProps extends GetConfigsParams {
  enabled?: boolean
}

export const useGetSecretConfigs = ({ groupName, key, enabled = true }: GetSecretConfigsProps) => {
  const query = useQuery({
    queryKey: configKeys.list(ConfigKind.secret, { groupName, key }),
    queryFn: () => configService.getSecretConfigs({ groupName, key }),
    enabled,
    throwOnError: false
  })

  return {
    secretConfigs: query.data,
    isGettingSecretConfigs: query.isLoading,
    isSecretConfigsError: query.isError,
    secretConfigsError: query.error,
    refetchSecretConfigs: query.refetch
  }
}
