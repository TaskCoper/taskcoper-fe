import { useQuery } from '@tanstack/react-query'
import { getMockAiCardDetail } from '../mock-data'
import { aiCardKeys } from '../query-keys'

export const useGetAiCardDetail = (id: string | undefined) => {
  const { data: aiCard, isLoading: isGettingAiCard } = useQuery({
    queryKey: aiCardKeys.detail(id ?? ''),
    queryFn: () => getMockAiCardDetail(id ?? ''),
    enabled: Boolean(id)
  })

  return { aiCard, isGettingAiCard }
}
