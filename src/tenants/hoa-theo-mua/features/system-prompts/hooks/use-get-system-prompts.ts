import { useQuery } from '@tanstack/react-query'
import { systemPromptKeys } from '../query-keys'
import systemPromptService from '../services'
import { mockSystemPromptSummaries } from '../mock-data'

export const useGetSystemPrompts = () => {
  const query = useQuery({
    queryKey: systemPromptKeys.list(),
    queryFn: async () => [...(await systemPromptService.getSystemPrompts()), ...mockSystemPromptSummaries],
    throwOnError: false
  })

  return {
    systemPrompts: query.data,
    isGettingSystemPrompts: query.isLoading,
    isSystemPromptsError: query.isError,
    refetchSystemPrompts: query.refetch
  }
}
