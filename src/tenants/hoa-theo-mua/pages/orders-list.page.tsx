import { DataTable } from '@/components/data-table/data-table'
import { DataTableToolbar } from '@/components/data-table/data-table-toolbar'
import { useDataTable } from '@/hooks/use-data-table'
import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { PackageIcon } from 'lucide-react'
import { parseAsArrayOf, parseAsInteger, parseAsString, useQueryState } from 'nuqs'
import { useEffect, useMemo, useRef } from 'react'
import { getNhanhVnColumns } from '../features/orders/components/nhanh-vn-order-columns'
import { useGetOrdersNhanhVn } from '../features/orders/hooks/use-get-orders-nhanh-vn'
import type { NhanhVnOrder } from '../features/orders/types'
import { vndFormatter } from '../features/orders/utils'

function parseIdsInput(str: string | null): number[] | undefined {
  if (!str) return undefined

  const ids = str
    .split(',')
    .map((s) => parseInt(s.trim(), 10))
    .filter((n) => !isNaN(n))

  return ids.length > 0 ? ids : undefined
}

function NhanhVnProductsSubRow({ row }: { row: { original: NhanhVnOrder } }) {
  const { t } = useTenantTranslation()

  const products = row.original.products ?? []
  if (!products.length) return null

  return (
    <div className='px-4 py-3'>
      <table className='w-full text-xs'>
        <thead>
          <tr className='text-muted-foreground'>
            <th className='text-left py-1.5 px-2 font-medium w-10'>{t('orders.productTable.image')}</th>
            <th className='text-left py-1.5 px-2 font-medium'>{t('orders.productTable.name')}</th>
            <th className='text-left py-1.5 px-2 font-medium'>{t('orders.productTable.sku')}</th>
            <th className='text-right py-1.5 px-2 font-medium'>{t('orders.productTable.quantity')}</th>
            <th className='text-right py-1.5 px-2 font-medium'>{t('orders.productTable.unitPrice')}</th>
            <th className='text-right py-1.5 px-2 font-medium'>{t('orders.productTable.total')}</th>
          </tr>
        </thead>
        <tbody className='divide-y divide-border'>
          {products.map((product, idx) => (
            <tr key={idx} className='hover:bg-background/60'>
              <td className='py-2 px-2'>
                {product.image ? (
                  <img src={product.image} alt={product.name} className='size-9 object-cover rounded border' />
                ) : (
                  <div className='size-9 rounded border bg-muted flex items-center justify-center'>
                    <PackageIcon className='size-4 text-muted-foreground/40' />
                  </div>
                )}
              </td>
              <td className='py-2 px-2 font-medium'>{product.name}</td>
              <td className='py-2 px-2 font-mono text-muted-foreground'>{product.code}</td>
              <td className='py-2 px-2 text-right'>{product.quantity}</td>
              <td className='py-2 px-2 text-right'>
                {product.price != null ? vndFormatter.format(product.price) : null}
              </td>
              <td className='py-2 px-2 text-right font-medium'>
                {vndFormatter.format((product.price ?? 0) * (product.quantity ?? 0))}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default function OrdersListPage() {
  const { t } = useTenantTranslation()
  const columns = useMemo(() => getNhanhVnColumns({ t }), [t])

  // Read filter/pagination values directly from URL.
  // Keys match what useDataTable writes with filterPrefix='orders'.
  const [idFilter] = useQueryState('orders_id', parseAsString.withOptions({ shallow: true }))
  const [depotFilter] = useQueryState('orders_depot', parseAsString.withOptions({ shallow: true }))
  const [createdAtFilter] = useQueryState(
    'orders_createdAt',
    parseAsArrayOf(parseAsString, ',').withOptions({ shallow: true })
  )
  const [pageUrl, setPageUrl] = useQueryState('orders_page', parseAsInteger.withOptions({ shallow: true }))
  const [perPageUrl] = useQueryState('orders_perPage', parseAsInteger.withOptions({ shallow: true }))

  const page = pageUrl ?? 1
  const pageSize = perPageUrl ?? 10

  const dateFrom = createdAtFilter?.[0] ? Math.floor(new Date(createdAtFilter[0]).getTime() / 1000) : undefined
  const dateTo = createdAtFilter?.[1] ? Math.floor(new Date(createdAtFilter[1]).getTime() / 1000) : undefined

  // cursor cache: always-current ref so useMemo can read it synchronously without stale-closure issues
  const cursorByPage = useRef<Record<number, { id: number } | undefined>>({})

  // read cursor for the current page synchronously — no one-render delay, no stale closure
  const currentCursor = useMemo(() => {
    return page === 1 ? undefined : cursorByPage.current[page]
  }, [page])

  // reset ref and go to page 1 when any filter or page size changes
  useEffect(() => {
    cursorByPage.current = {}
    void setPageUrl(1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idFilter, depotFilter, createdAtFilter?.[0], createdAtFilter?.[1], pageSize])

  const { nhanhVnOrders, paginator, isLoadingNhanhVnOrders } = useGetOrdersNhanhVn({
    createdAtFrom: dateFrom,
    createdAtTo: dateTo,
    ids: parseIdsInput(idFilter),
    depotIds: parseIdsInput(depotFilter),
    size: pageSize,
    nextCursor: currentCursor
  })

  const nextCursorId = paginator?.next?.id
  useEffect(() => {
    if (nextCursorId !== undefined) {
      cursorByPage.current[page + 1] = { id: nextCursorId }
    }
  }, [nextCursorId, page])

  useEffect(() => {
    if (page > 1 && currentCursor === undefined) {
      cursorByPage.current = {}
      void setPageUrl(1)
    }
  }, [page, currentCursor, setPageUrl])

  const pageCount = paginator?.next ? page + 1 : page

  const { table } = useDataTable({
    data: nhanhVnOrders ?? [],
    columns,
    pageCount,
    initialState: {
      columnPinning: { right: ['actions'] }
    },
    getRowId: (row) => String(row.info.id),
    shallow: true,
    clearOnDefault: true,
    filterPrefix: 'orders',
    queryKeys: {
      page: 'orders_page',
      perPage: 'orders_perPage',
      sort: 'orders_sort'
    }
  })

  return (
    <div className='h-full overflow-auto'>
      <div className='p-6 space-y-4' style={{ minWidth: table.getTotalSize() + 48 }}>
        <div className='flex justify-between items-center gap-4'>
          <div>
            <p className='text-2xl font-bold'>{t('orders.list.title')}</p>
            <p className='text-sm text-muted-foreground'>{t('orders.list.description')}</p>
          </div>
        </div>

        <DataTable
          table={table}
          isLoading={isLoadingNhanhVnOrders}
          renderSubComponent={({ row }) => <NhanhVnProductsSubRow row={row} />}
        >
          <DataTableToolbar table={table} />
        </DataTable>
      </div>
    </div>
  )
}
