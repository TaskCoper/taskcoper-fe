import { useQuery } from '@tanstack/react-query'
import { getMockAiFlowerDesignDetail } from '../ai-flower-design-mock-data'
import { aiFlowerDesignKeys } from '../query-keys'

export const useGetAiFlowerDesignDetail = (id: string | undefined) => {
  const { data: aiFlowerDesign, isLoading: isGettingAiFlowerDesign } = useQuery({
    queryKey: aiFlowerDesignKeys.detail(id ?? ''),
    queryFn: async () => {
      try {
        return await getMockAiFlowerDesignDetail(id ?? '')
      } catch {
        return null
      }
    },
    enabled: Boolean(id),
    staleTime: 0,
    refetchOnMount: 'always'
  })

  return { aiFlowerDesign, isGettingAiFlowerDesign }
}
