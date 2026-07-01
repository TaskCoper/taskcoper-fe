import { useQuery } from '@tanstack/react-query'
import configService from '../services'
import type { GetConfigsParams } from '../types'

interface GetContentConfigsProps extends GetConfigsParams {
  isPublic?: boolean
  enabled?: boolean
}

export const useGetContentConfigs = ({ groupName, key, isPublic, enabled = true }: GetContentConfigsProps = {}) => {
  const { data: contentConfigs, isLoading: isGettingContentConfigs } = useQuery({
    queryKey: ['configs', 'content', groupName, key, isPublic],
    queryFn: () => configService.getContentConfigs({ groupName, isPublic, key }),
    enabled
  })

  return { contentConfigs, isGettingContentConfigs }
}
