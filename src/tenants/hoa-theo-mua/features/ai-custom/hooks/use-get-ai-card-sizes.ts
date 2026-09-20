import { useQuery } from '@tanstack/react-query'
import { mockAiCardSizes } from '../mock-data'
import { aiCardKeys } from '../query-keys'
import generateAiService from '../services'

export const useGetAiCardSizes = () => {
  const { data: aiCardSizes, isLoading: isGettingAiCardSizes } = useQuery({
    queryKey: aiCardKeys.sizes(),
    queryFn: async () => (await generateAiService.getAiCardSizes().catch(() => null)) ?? mockAiCardSizes,
    throwOnError: false
  })

  return { aiCardSizes: aiCardSizes ?? mockAiCardSizes, isGettingAiCardSizes }
}
