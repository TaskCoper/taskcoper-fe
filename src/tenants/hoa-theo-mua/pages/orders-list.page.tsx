import { DataTable } from '@/components/data-table/data-table'
import { DataTableViewOptions } from '@/components/data-table/data-table-view-options'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useDataTable } from '@/hooks/use-data-table'
import { useDebouncedCallback } from '@/hooks/use-debounced-callback'
import { useTableQueryParams } from '@/hooks/use-table-query-params'
import { formatDateTime } from '@/lib/date'
import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import type { ExtendedColumnSort } from '@/types/data-table.type'
import { endOfDay, startOfDay } from 'date-fns'
import { CalendarIcon, PackageIcon, X } from 'lucide-react'
import { parseAsInteger, parseAsString, useQueryState } from 'nuqs'
import { useEffect, useMemo, useRef, useState } from 'react'
import type { DateRange } from 'react-day-picker'
import { getNhanhVnColumns } from '../features/orders/components/nhanh-vn-order-columns'
import { useGetOrdersNhanhVn } from '../features/orders/hooks/use-get-orders-nhanh-vn'
import type { NhanhVnOrder } from '../features/orders/types'
import { vndFormatter } from '../features/orders/utils'

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

function DateRangeLabel({ range, placeholder }: { range: DateRange; placeholder: string }) {
  if (!range.from && !range.to) {
    return <span className='text-muted-foreground'>{placeholder}</span>
  }

  const from = range.from ? formatDateTime(range.from, 'dateShort') : '...'
  const to = range.to ? formatDateTime(range.to, 'dateShort') : '...'

  return (
    <span>
      {from} – {to}
    </span>
  )
}

function parseIdsInput(str: string | null): number[] | undefined {
  if (!str) return undefined

  const ids = str
    .split(',')
    .map((s) => parseInt(s.trim(), 10))
    .filter((n) => !isNaN(n))

  return ids.length > 0 ? ids : undefined
}

export default function OrdersListPage() {
  const { t } = useTenantTranslation()
  const columns = useMemo(() => getNhanhVnColumns({ t }), [t])

  const { page, limit, sorting } = useTableQueryParams({ columns, prefix: 'orders' })
  const [, setPageUrl] = useQueryState('orders_page', parseAsInteger.withOptions({ shallow: true }))

  const [dateFrom, setDateFrom] = useQueryState('dateFrom', parseAsInteger.withOptions({ shallow: true }))
  const [dateTo, setDateTo] = useQueryState('dateTo', parseAsInteger.withOptions({ shallow: true }))

  const [idsFilter, setIdsFilter] = useQueryState('orderIds', parseAsString.withOptions({ shallow: true }))
  const [idsInput, setIdsInput] = useState(idsFilter ?? '')

  const [depotIdsFilter, setDepotIdsFilter] = useQueryState('depotIds', parseAsString.withOptions({ shallow: true }))
  const [depotIdsInput, setDepotIdsInput] = useState(depotIdsFilter ?? '')

  const dateRange: DateRange = {
    from: dateFrom ? new Date(dateFrom * 1000) : undefined,
    to: dateTo ? new Date(dateTo * 1000) : undefined
  }

  const hasFilters = dateFrom != null || dateTo != null || !!idsFilter || !!depotIdsFilter

  const debouncedSetIds = useDebouncedCallback((value: string) => setIdsFilter(value || null), 300)
  const debouncedSetDepotIds = useDebouncedCallback((value: string) => setDepotIdsFilter(value || null), 300)

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
  }, [dateFrom, dateTo, idsFilter, depotIdsFilter, limit])

  const { nhanhVnOrders, paginator, isLoadingNhanhVnOrders } = useGetOrdersNhanhVn({
    createdAtFrom: dateFrom ?? undefined,
    createdAtTo: dateTo ?? undefined,
    ids: parseIdsInput(idsFilter),
    depotIds: parseIdsInput(depotIdsFilter),
    size: limit,
    nextCursor: currentCursor
  })

  // store next cursor into the ref as soon as it arrives (triggers no extra re-render)
  const nextCursorId = paginator?.next?.id
  useEffect(() => {
    if (nextCursorId !== undefined) {
      cursorByPage.current[page + 1] = { id: nextCursorId }
    }
  }, [nextCursorId, page])

  // if page > 1 but cursor is missing (e.g. after hard refresh), reset to page 1
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
      sorting: (sorting ?? []) as ExtendedColumnSort<NhanhVnOrder>[],
      columnPinning: { right: ['actions'] }
    },
    getRowId: (row) => String(row.info.id),
    shallow: true,
    clearOnDefault: true,
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
          <div className='flex w-full items-center justify-between gap-2 p-1'>
            <div className='flex flex-wrap items-center gap-2'>
              <Input
                placeholder={t('orders.filter.orderIdsPlaceholder')}
                value={idsInput}
                onChange={(e) => {
                  setIdsInput(e.target.value)
                  debouncedSetIds(e.target.value)
                }}
                className='h-7.5 w-52'
                spellCheck={false}
              />

              <Input
                placeholder={t('orders.filter.depotIdsPlaceholder')}
                value={depotIdsInput}
                onChange={(e) => {
                  setDepotIdsInput(e.target.value)
                  debouncedSetDepotIds(e.target.value)
                }}
                className='h-7.5 w-36'
                spellCheck={false}
              />

              <Popover>
                <PopoverTrigger asChild>
                  <Button variant='outline' size='sm' className='h-7.5 gap-2 border-dashed text-sm font-normal'>
                    <CalendarIcon className='size-4' />
                    <DateRangeLabel range={dateRange} placeholder={t('orders.filter.dateRange')} />
                    {(dateRange.from || dateRange.to) && (
                      <span
                        role='button'
                        className='ml-1 rounded-full hover:text-destructive'
                        onClick={(e) => {
                          e.stopPropagation()
                          setDateFrom(null)
                          setDateTo(null)
                        }}
                      >
                        <X className='size-3' />
                      </span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className='w-auto p-0' align='start'>
                  <Calendar
                    autoFocus
                    captionLayout='dropdown'
                    mode='range'
                    selected={dateRange}
                    onSelect={(range) => {
                      setDateFrom(range?.from ? Math.floor(startOfDay(range.from).getTime() / 1000) : null)
                      setDateTo(range?.to ? Math.floor(endOfDay(range.to).getTime() / 1000) : null)
                    }}
                  />
                </PopoverContent>
              </Popover>

              {hasFilters && (
                <Button
                  variant='destructive'
                  size='sm'
                  className='h-7.5 border-dashed'
                  onClick={() => {
                    setDateFrom(null)
                    setDateTo(null)
                    setIdsInput('')
                    void setIdsFilter(null)
                    setDepotIdsInput('')
                    void setDepotIdsFilter(null)
                  }}
                >
                  <X className='size-4' />
                  {t('orders.filter.reset')}
                </Button>
              )}
            </div>
            <DataTableViewOptions table={table} align='end' />
          </div>
        </DataTable>
      </div>
    </div>
  )
}
