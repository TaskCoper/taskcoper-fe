import { useQuery } from '@tanstack/react-query'
import { systemPromptKeys } from '../query-keys'
import systemPromptService from '../services'
import { getMockSystemPrompt } from '../mock-data'

export const useGetSystemPrompt = (id?: string) => {
  const query = useQuery({
    queryKey: systemPromptKeys.detail(id ?? ''),
    queryFn: () =>
      id?.startsWith('mock-') ? Promise.resolve(getMockSystemPrompt(id)!) : systemPromptService.getSystemPrompt(id!),
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
