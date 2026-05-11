import { DataTable } from '@/components/data-table/data-table'
import { DataTableToolbar } from '@/components/data-table/data-table-toolbar'
import { useDataTable } from '@/hooks/use-data-table'
import { useTableQueryParams } from '@/hooks/use-table-query-params'
import { type ExtendedColumnSort } from '@/types/data-table.type'
import { parseAsString, useQueryState } from 'nuqs'
import { useMemo } from 'react'
import { useGetVoucherRedemptions } from '../hooks/use-get-voucher-redemptions'
import { type VoucherRedemptionRow } from '../types'
import { getColumns } from './columns/redemption-columns'

interface RedemptionsTableProps {
  voucherId: string
}

export default function RedemptionsTable({ voucherId }: RedemptionsTableProps) {
  const columns = useMemo(() => getColumns(), [])

  const { page, limit, sorting, orderBy, sortBy } = useTableQueryParams({
    columns,
    prefix: 'redemptions'
  })

  const [searchTermFilter] = useQueryState('redemptions_appliedTo', parseAsString)

  const searchTerm = searchTermFilter ?? undefined

  const { redemptions, isLoadingRedemptions } = useGetVoucherRedemptions({
    voucherId,
    pageIndex: page,
    pageSize: limit,
    sortBy: sortBy ? (orderBy === 'desc' ? `-${sortBy}` : sortBy) : undefined,
    searchTerm
  })

  const { table } = useDataTable({
    data: redemptions?.value?.items ?? [],
    columns,
    pageCount: redemptions?.value ? Math.ceil(redemptions.value.totalCount / limit) : 0,
    initialState: {
      sorting: (sorting ?? []) as ExtendedColumnSort<VoucherRedemptionRow>[],
      columnPinning: { right: ['actions'] }
    },
    getRowId: (row) => row.redemptionId,
    shallow: false,
    clearOnDefault: true,
    queryKeys: {
      page: 'redemptions_page',
      perPage: 'redemptions_perPage',
      sort: 'redemptions_sort'
    },
    filterPrefix: 'redemptions'
  })

  return (
    <DataTable table={table} isLoading={isLoadingRedemptions}>
      <DataTableToolbar table={table} />
    </DataTable>
  )
}
