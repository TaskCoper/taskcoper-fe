import { useQuery } from '@tanstack/react-query'
import { configKeys } from '../query-keys'
import configService from '../services'
import type { GetConfigsParams } from '../types'

interface GetContentConfigsProps extends GetConfigsParams {
  isPublic?: boolean
  enabled?: boolean
}

export const useGetContentConfigs = ({ groupName, key, isPublic, enabled = true }: GetContentConfigsProps = {}) => {
  const query = useQuery({
    queryKey: configKeys.contentList({ groupName, key, isPublic }),
    queryFn: () => configService.getContentConfigs({ groupName, isPublic, key }),
    enabled,
    throwOnError: false
  })

  return {
    contentConfigs: query.data,
    isGettingContentConfigs: query.isLoading,
    isContentConfigsError: query.isError,
    contentConfigsError: query.error,
    refetchContentConfigs: query.refetch
  }
}
