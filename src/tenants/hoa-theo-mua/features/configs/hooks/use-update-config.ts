import { useMutation, useQueryClient } from '@tanstack/react-query'
import configSystemService from '../services'
import type { ConfigRecordValue } from '../types'
import { CONFIG_RECORDS_QUERY_KEY } from './use-get-configs'

export const useUpdateConfig = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: { key: string; value: ConfigRecordValue } }) =>
      configSystemService.updateConfigRecord({ id, body }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CONFIG_RECORDS_QUERY_KEY })
    }
  })
}
