import { useQuery } from '@tanstack/react-query'
import { systemPromptKeys } from '../query-keys'
import systemPromptService from '../services'

export const useGetSystemPrompt = (id?: string) => {
  const query = useQuery({
    queryKey: systemPromptKeys.detail(id ?? ''),
    queryFn: () => systemPromptService.getSystemPrompt(id!),
    enabled: Boolean(id),
    throwOnError: false
  })

  return {
    systemPrompt: query.data,
    isGettingSystemPrompt: query.isLoading,
    isSystemPromptError: query.isError,
    refetchSystemPrompt: query.refetch
  }
}
