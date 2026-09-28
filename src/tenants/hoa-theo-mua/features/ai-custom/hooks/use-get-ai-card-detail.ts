import { useQuery } from '@tanstack/react-query'
import { aiCardKeys } from '../query-keys'
import generateAiService from '../services'

export const useGetAiCardDetail = (generatedCardId: string | undefined) => {
  const { data: aiCard, isLoading: isGettingAiCard } = useQuery({
    queryKey: aiCardKeys.detail(generatedCardId ?? ''),
    queryFn: () => generateAiService.getAiCardHistoryDetail(generatedCardId ?? ''),
    enabled: Boolean(generatedCardId)
  })

  return { aiCard, isGettingAiCard }
}
