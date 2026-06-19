import { useMutation, useQueryClient } from '@tanstack/react-query'
import configSystemService from '../services'

export const useUpdateConfig = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ key, value }: { key: string; value: unknown }) => configSystemService.updateConfig({ key, value }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['htm-system-configs', 'list'] })
    }
  })
}
