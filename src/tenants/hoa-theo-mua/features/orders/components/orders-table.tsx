import { DataTable } from '@/components/data-table/data-table'
import { DataTableToolbar } from '@/components/data-table/data-table-toolbar'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useDataTable } from '@/hooks/use-data-table'
import { useTableQueryParams } from '@/hooks/use-table-query-params'
import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import type { Row } from '@tanstack/react-table'
import { useMemo } from 'react'
import { useGetOrders } from '../hooks/use-get-orders'
import type { Order } from '../types'
import { numberFormatter, vndFormatter } from '../utils'
import { getColumns } from './order-columns'

/** Expanded line-item table for a single order (`orderNhanhVnDetails`). */
function OrderDetailsSubRow({ row }: { row: Row<Order> }) {
  const { t } = useTenantTranslation()
  const details = row.original.orderNhanhVnDetails ?? []
  const emptyValue = t('orders.common.noDataShort')

  if (!details.length) return null

  return (
    <div className='px-4 py-3'>
      <Table>
        <TableHeader>
          <TableRow className='hover:bg-transparent'>
            <TableHead className='text-muted-foreground text-sm font-medium'>{t('orders.productTable.name')}</TableHead>
            <TableHead className='text-muted-foreground text-sm font-medium'>{t('orders.productTable.sku')}</TableHead>
            <TableHead className='text-muted-foreground text-sm font-medium'>
              {t('orders.productTable.barcode')}
            </TableHead>
            <TableHead className='text-muted-foreground text-sm font-medium'>
              {t('orders.productTable.category')}
            </TableHead>
            <TableHead className='text-muted-foreground text-sm font-medium'>{t('orders.productTable.unit')}</TableHead>
            <TableHead className='text-muted-foreground text-sm font-medium text-right'>
              {t('orders.productTable.weight')}
            </TableHead>
            <TableHead className='text-muted-foreground text-sm font-medium text-right'>
              {t('orders.productTable.quantity')}
            </TableHead>
            <TableHead className='text-muted-foreground text-sm font-medium text-right'>
              {t('orders.productTable.unitPrice')}
            </TableHead>
            <TableHead className='text-muted-foreground text-sm font-medium text-right'>
              {t('orders.productTable.discount')}
            </TableHead>
            <TableHead className='text-muted-foreground text-sm font-medium text-right'>
              {t('orders.productTable.total')}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {details.map((detail) => {
            const quantity = detail.soLuong ?? 0
            const unitPrice = detail.giaBan
            // Prefer the server-computed post-discount line total; otherwise derive it from unit price × qty.
            const lineTotal = detail.giaSanPhamSauChietKhau ?? (unitPrice != null ? unitPrice * quantity : null)
            const gift = detail.quaTangKem?.trim()
            const note = detail.ghiChuSanPham?.trim()

            return (
              <TableRow key={detail.id} className='text-sm align-top'>
                <TableCell className='font-medium'>
                  <span className='block'>{detail.tenSanPham?.trim() || emptyValue}</span>
                  {gift && (
                    <span className='mt-0.5 block text-xs font-normal text-emerald-600 dark:text-emerald-400'>
                      🎁 {gift}
                    </span>
                  )}
                  {note && <span className='mt-0.5 block text-xs font-normal text-muted-foreground'>{note}</span>}
                </TableCell>
                <TableCell className='font-mono text-muted-foreground'>
                  {detail.maSanPham?.trim() || emptyValue}
                </TableCell>
                <TableCell className='font-mono text-muted-foreground'>{detail.maVach?.trim() || emptyValue}</TableCell>
                <TableCell className='text-muted-foreground'>{detail.danhMucSanPham?.trim() || emptyValue}</TableCell>
                <TableCell className='text-muted-foreground'>{detail.donViTinh?.trim() || emptyValue}</TableCell>
                <TableCell className='text-right tabular-nums'>
                  {detail.khoiLuongSanPham != null ? numberFormatter.format(detail.khoiLuongSanPham) : emptyValue}
                </TableCell>
                <TableCell className='text-right tabular-nums'>{quantity}</TableCell>
                <TableCell className='text-right tabular-nums'>
                  {unitPrice != null ? vndFormatter.format(unitPrice) : emptyValue}
                </TableCell>
                <TableCell className='text-right tabular-nums text-muted-foreground'>
                  {detail.chietKhauSanPham != null ? vndFormatter.format(detail.chietKhauSanPham) : emptyValue}
                </TableCell>
                <TableCell className='text-right font-medium tabular-nums'>
                  {lineTotal != null ? vndFormatter.format(lineTotal) : emptyValue}
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}

export function OrdersTable() {
  const { t } = useTenantTranslation()
  const columns = useMemo(() => getColumns({ t }), [t])

  const { page, limit } = useTableQueryParams({ columns, prefix: 'orders' })

  const { orders, isGettingOrders } = useGetOrders({ pageIndex: page, pageSize: limit })

  const items = orders?.value.items ?? []
  const totalCount = orders?.value.totalCount ?? 0

  const { table } = useDataTable({
    data: items,
    columns,
    pageCount: Math.ceil(totalCount / limit) || 1,
    initialState: {
      columnPinning: { right: ['actions'] },
      // Secondary columns are available via the "Columns" toggle but hidden by default to keep the table readable.
      columnVisibility: {
        orderType: false,
        trackingCode: false,
        customerCare: false,
        shippingFee: false,
        discount: false,
        profit: false,
        weight: false,
        reconciliation: false,
        completedAt: false,
        customerNote: false
      }
    },
    getRowId: (row) => row.id,
    shallow: false,
    clearOnDefault: true,
    filterPrefix: 'orders',
    queryKeys: {
      page: 'orders_page',
      perPage: 'orders_perPage',
      sort: 'orders_sort'
    }
  })

  return (
    <DataTable
      table={table}
      isLoading={isGettingOrders}
      renderSubComponent={({ row }) => <OrderDetailsSubRow row={row} />}
    >
      <DataTableToolbar table={table} />
    </DataTable>
  )
}
