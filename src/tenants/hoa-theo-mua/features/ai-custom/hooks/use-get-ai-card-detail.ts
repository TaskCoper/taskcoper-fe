import { useQuery } from '@tanstack/react-query'
import { getMockGeneratedCardDetail } from '../mock-data'
import { aiCardKeys } from '../query-keys'
import generateAiService from '../services'

export const useGetAiCardDetail = (generatedCardId: string | undefined) => {
  const { data: aiCard, isLoading: isGettingAiCard } = useQuery({
    queryKey: aiCardKeys.detail(generatedCardId ?? ''),
    queryFn: async () => {
      try {
        return await generateAiService.getAiCardHistoryDetail(generatedCardId ?? '')
      } catch {
        return getMockGeneratedCardDetail(generatedCardId ?? '')
      }
    },
    enabled: Boolean(generatedCardId)
  })

  return { aiCard, isGettingAiCard }
}
