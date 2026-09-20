import { useQuery } from '@tanstack/react-query'
import { aiFlowerDesignKeys } from '../query-keys'
import generateAiService from '../services'

export const useGetAiFlowerDesignDetail = (id: string | undefined) => {
  const { data: aiFlowerDesign, isLoading: isGettingAiFlowerDesign } = useQuery({
    queryKey: aiFlowerDesignKeys.detail(id ?? ''),
    queryFn: () => generateAiService.getAiFlowerDesignDetail(id ?? ''),
    enabled: Boolean(id),
    staleTime: 0,
    refetchOnMount: 'always'
  })

  return { aiFlowerDesign, isGettingAiFlowerDesign }
}
