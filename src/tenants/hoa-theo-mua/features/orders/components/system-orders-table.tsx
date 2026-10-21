import { DataTable } from '@/components/data-table/data-table'
import { DataTableToolbar } from '@/components/data-table/data-table-toolbar'
import { useDataTable } from '@/hooks/use-data-table'
import { useTableQueryParams } from '@/hooks/use-table-query-params'
import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { parseAsString, useQueryState } from 'nuqs'
import { useMemo, useState } from 'react'
import { useGetSystemOrders } from '../hooks/use-get-system-orders'
import { useManualConfirmPayment } from '../hooks/use-manual-confirm-payment'
import type { SystemOrder } from '../types'
import { getSystemOrderColumns } from './system-order-columns'
import SystemOrderEditDialog from './update-system-order-dialog'

export function SystemOrdersTable() {
  const { t } = useTenantTranslation()
  const [editingOrder, setEditingOrder] = useState<SystemOrder | null>(null)
  const { manualConfirmPayment } = useManualConfirmPayment()
  const columns = useMemo(
    () => getSystemOrderColumns({ t, onEdit: setEditingOrder, onConfirmPayment: manualConfirmPayment }),
    [manualConfirmPayment, t]
  )

  const { page, limit } = useTableQueryParams({ columns, prefix: 'system-orders' })

  const [searchFilter] = useQueryState('system-orders_customer', parseAsString)

  const search = searchFilter ?? undefined

  const { systemOrders, isGettingSystemOrders } = useGetSystemOrders({ pageIndex: page, pageSize: limit, search })

  const items = systemOrders?.value.items ?? []
  const totalCount = systemOrders?.value.totalCount ?? 0

  const { table } = useDataTable({
    data: items,
    columns,
    pageCount: Math.ceil(totalCount / limit) || 1,
    initialState: {
      columnPinning: { right: ['actions'] },
      columnVisibility: {
        shippingFee: false,
        productFee: false,
        invoice: false,
        remarks: false
      }
    },
    shallow: false,
    clearOnDefault: true,
    filterPrefix: 'system-orders',
    queryKeys: {
      page: 'system-orders_page',
      perPage: 'system-orders_perPage',
      sort: 'system-orders_sort'
    }
  })

  return (
    <>
      <DataTable table={table} isLoading={isGettingSystemOrders}>
        <DataTableToolbar table={table} />
      </DataTable>

      <SystemOrderEditDialog
        order={editingOrder}
        open={!!editingOrder}
        onOpenChange={(open) => !open && setEditingOrder(null)}
      />
    </>
  )
}
