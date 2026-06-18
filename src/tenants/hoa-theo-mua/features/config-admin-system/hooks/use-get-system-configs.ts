import { queryKeys } from '@/lib/query-keys'
import { getDefaultPaginationResponse } from '@/shared/utils'
import { useQuery } from '@tanstack/react-query'
import configSystemService, { type ConfigSystemItem } from '../service'

export const useGetSystemConfigs = () => {
  const { data: systemConfigs = getDefaultPaginationResponse<ConfigSystemItem>(), isLoading: isLoadingSystemConfigs } =
    useQuery({
      queryKey: queryKeys.htmSystemConfigs.list(),
      queryFn: () => configSystemService.getConfigs(),
      throwOnError: false
    })

  return { systemConfigs, isLoadingSystemConfigs }
}
