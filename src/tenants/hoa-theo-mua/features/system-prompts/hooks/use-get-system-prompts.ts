import { useQuery } from '@tanstack/react-query'
import { systemPromptKeys } from '../query-keys'
import systemPromptService from '../services'

export const useGetSystemPrompts = () => {
  const query = useQuery({
    queryKey: systemPromptKeys.list(),
    queryFn: systemPromptService.getSystemPrompts,
    throwOnError: false
  })

  return {
    systemPrompts: query.data,
    isGettingSystemPrompts: query.isLoading,
    isSystemPromptsError: query.isError,
    refetchSystemPrompts: query.refetch
  }
}
