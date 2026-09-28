import { useQuery } from '@tanstack/react-query'
import { aiCardKeys } from '../query-keys'
import generateAiService from '../services'

export const useGetAiCardSizes = () => {
  const { data: aiCardSizes, isLoading: isGettingAiCardSizes } = useQuery({
    queryKey: aiCardKeys.sizes(),
    queryFn: generateAiService.getAiCardSizes
  })

  return { aiCardSizes, isGettingAiCardSizes }
}
