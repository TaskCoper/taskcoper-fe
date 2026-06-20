import { getDefaultPaginationResponse } from '@/shared/utils'
import { useQuery } from '@tanstack/react-query'
import configSystemService from '../services'
import type { ConfigSystemItem } from '../types'

export const useGetSystemConfigs = () => {
  const { data: systemConfigs = getDefaultPaginationResponse<ConfigSystemItem>(), isLoading: isLoadingSystemConfigs } =
    useQuery({
      queryKey: ['htm-system-configs', 'list'],
      queryFn: () => configSystemService.getConfigs(),
      throwOnError: false
    })

  return { systemConfigs, isLoadingSystemConfigs }
}
