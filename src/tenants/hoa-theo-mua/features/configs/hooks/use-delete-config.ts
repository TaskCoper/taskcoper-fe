import { useMutation, useQueryClient } from '@tanstack/react-query'
import configSystemService from '../services'
import { CONFIG_RECORDS_QUERY_KEY } from './use-get-configs'

export const useDeleteConfig = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id }: { id: string }) => configSystemService.deleteConfigRecord({ id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CONFIG_RECORDS_QUERY_KEY })
    }
  })
}
