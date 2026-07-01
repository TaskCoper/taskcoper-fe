import { useQuery } from '@tanstack/react-query'
import configService from '../services'
import type { GetConfigsParams } from '../types'

interface GetSettingConfigsProps extends GetConfigsParams {
  enabled?: boolean
}

export const useGetSettingConfigs = ({ groupName, key, enabled = true }: GetSettingConfigsProps) => {
  const { data: settingConfigs, isLoading: isGettingSettingConfigs } = useQuery({
    queryKey: ['configs', 'setting', groupName, key],
    queryFn: () => configService.getSettingConfigs({ groupName, key }),
    enabled
  })

  return { settingConfigs, isGettingSettingConfigs }
}
