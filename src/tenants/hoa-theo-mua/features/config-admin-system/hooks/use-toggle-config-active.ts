import { queryKeys } from '@/lib/query-keys'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import configSystemService from '../service'

export const useToggleConfigActive = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ key, isActive }: { key: string; isActive: boolean }) =>
      configSystemService.updateConfigActive(key, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.htmSystemConfigs.list() })
    }
  })
}
