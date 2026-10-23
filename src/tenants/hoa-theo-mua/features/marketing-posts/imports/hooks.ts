import { keepPreviousData, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import z from 'zod'
import { marketingPostKeys } from '../query-keys'
import service from './services'
import { importKeys, importPollInterval } from './types'

export function useImportList() {
  const client = useQueryClient()
  const query = useQuery({
    queryKey: importKeys.list,
    queryFn: service.list,
    throwOnError: false,
    refetchInterval: (q) =>
      q.state.data?.some((x) => x.status === 'Processing')
        ? 5000
        : q.state.data?.some((x) => x.status === 'Scheduled')
          ? 30000
          : false
  })
  useEffect(() => {
    if (query.data) client.invalidateQueries({ queryKey: marketingPostKeys.lists() })
  }, [query.data, client])
  return query
}
export function useImportDetail(id: string, page: number) {
  return useQuery({
    queryKey: importKeys.detail(id, page),
    queryFn: () => service.detail(id, page),
    enabled: z.string().uuid().safeParse(id).success,
    throwOnError: false,
    placeholderData: keepPreviousData,
    refetchInterval: (q) => importPollInterval(q.state.data?.batch)
  })
}
