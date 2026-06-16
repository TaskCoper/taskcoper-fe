import { useMemo } from 'react'
import { useGetOrders } from '../features/orders/hooks/use-get-orders'
import { getColumns } from '../features/orders/components/order-columns'
import { useTableQueryParams } from '@/hooks/use-table-query-params'
import { useDataTable } from '@/hooks/use-data-table'
import type { ExtendedColumnSort } from '@/types/data-table.type'
import type { OrderRow } from '../features/orders/types'
import { DataTable } from '@/components/data-table/data-table'
import { DataTableToolbar } from '@/components/data-table/data-table-toolbar'
import { parseAsString, useQueryState } from 'nuqs'

export default function OrdersListPage() {
  const columns = useMemo(() => getColumns(), [])

  const { page, limit, sorting } = useTableQueryParams({
    columns,
    prefix: 'orders'
  })

  const [titleFilter] = useQueryState('title', parseAsString)

  const title = titleFilter ?? undefined

  const { orders, isOrdersLoading } = useGetOrders({
    pageIndex: page,
    pageSize: limit,
    keyword: title
  })

  const { table } = useDataTable({
    data: orders.value.items,
    columns,
    pageCount: Math.ceil(orders.value.totalCount / limit),
    initialState: {
      sorting: (sorting ?? []) as ExtendedColumnSort<OrderRow>[],
      columnPinning: { right: ['actions'] },
      columnVisibility: {
        domainId: false,
        memberIds: false
      }
    },
    getRowId: ({ orderId }) => orderId,
    shallow: false,
    clearOnDefault: true,
    queryKeys: {
      page: 'orders_page',
      perPage: 'orders_perPage',
      sort: 'orders_sort'
    },
    filterPrefix: 'orders'
  })

  const isLoading = isOrdersLoading

  return (
    <div className='p-6 space-y-4 mx-auto'>
      <DataTable table={table} isLoading={isLoading}>
        <DataTableToolbar table={table}></DataTableToolbar>
      </DataTable>
    </div>
  )
}
