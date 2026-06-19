import React, { useMemo, useState } from 'react'
import type { DateRange } from 'react-day-picker'
import { endOfDay, startOfDay } from 'date-fns'
import { parseAsInteger, parseAsString, useQueryState } from 'nuqs'
import { useDebouncedCallback } from '@/hooks/use-debounced-callback'
import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { useGetOrdersNhanhVn } from '../features/orders/hooks/use-get-orders-nhanh-vn'
import { getNhanhVnColumns } from '../features/orders/components/nhanh-vn-order-columns'
import { useTableQueryParams } from '@/hooks/use-table-query-params'
import { useDataTable } from '@/hooks/use-data-table'
import type { ExtendedColumnSort } from '@/types/data-table.type'
import type { NhanhVnOrder } from '../features/orders/types'
import { DataTable } from '@/components/data-table/data-table'
import { DataTableViewOptions } from '@/components/data-table/data-table-view-options'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { PackageIcon, CalendarIcon, UserIcon, X } from 'lucide-react'
import { formatDateTime } from '@/lib/date'

function NhanhVnProductsSubRow({ row }: { row: { original: NhanhVnOrder } }) {
  const products = row.original.products ?? []
  if (!products.length) return null

  return (
    <div className='px-4 py-3'>
      <table className='w-full text-xs'>
        <thead>
          <tr className='text-muted-foreground'>
            <th className='text-left py-1.5 px-2 font-medium w-10'>Ảnh</th>
            <th className='text-left py-1.5 px-2 font-medium'>Tên sản phẩm</th>
            <th className='text-left py-1.5 px-2 font-medium'>Mã SP</th>
            <th className='text-right py-1.5 px-2 font-medium'>SL</th>
            <th className='text-right py-1.5 px-2 font-medium'>Đơn giá</th>
            <th className='text-right py-1.5 px-2 font-medium'>Thành tiền</th>
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
              <td className='py-2 px-2 text-right'>{product.price?.toLocaleString('vi-VN')} ₫</td>
              <td className='py-2 px-2 text-right font-medium'>
                {((product.price ?? 0) * (product.quantity ?? 0)).toLocaleString('vi-VN')} ₫
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function DateRangeLabel({ range, placeholder }: { range: DateRange; placeholder: string }) {
  if (!range.from && !range.to) return <span className='text-muted-foreground'>{placeholder}</span>
  const from = range.from ? formatDateTime(range.from, 'dateShort') : '...'
  const to = range.to ? formatDateTime(range.to, 'dateShort') : '...'
  return (
    <span>
      {from} – {to}
    </span>
  )
}

export default function OrdersListPage() {
  const { t } = useTenantTranslation()
  const columns = useMemo(() => getNhanhVnColumns(), [])

  const { page, limit, sorting } = useTableQueryParams({ columns, prefix: 'orders' })

  const [saleNameFilter, setSaleNameFilter] = useQueryState(
    'saleName',
    parseAsString.withDefault('').withOptions({ shallow: true, clearOnDefault: true })
  )
  const [saleNameInput, setSaleNameInput] = useState(saleNameFilter)

  const [dateFrom, setDateFrom] = useQueryState('dateFrom', parseAsInteger.withOptions({ shallow: true }))
  const [dateTo, setDateTo] = useQueryState('dateTo', parseAsInteger.withOptions({ shallow: true }))

  const dateRange: DateRange = {
    from: dateFrom ? new Date(dateFrom * 1000) : undefined,
    to: dateTo ? new Date(dateTo * 1000) : undefined
  }

  const hasFilters = saleNameFilter !== '' || dateFrom != null || dateTo != null

  const debouncedSetSaleName = useDebouncedCallback((value: string) => {
    setSaleNameFilter(value || null)
  }, 300)

  const handleSaleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSaleNameInput(e.target.value)
    debouncedSetSaleName(e.target.value)
  }

  const { nhanhVnOrders, isLoadingNhanhVnOrders } = useGetOrdersNhanhVn({
    createdAtFrom: dateFrom ?? undefined,
    createdAtTo: dateTo ?? undefined,
    saleName: saleNameFilter || undefined
  })

  const pagedData = useMemo(() => nhanhVnOrders.slice((page - 1) * limit, page * limit), [nhanhVnOrders, page, limit])

  const { table } = useDataTable({
    data: pagedData,
    columns,
    pageCount: Math.max(1, Math.ceil(nhanhVnOrders.length / limit)),
    initialState: {
      sorting: (sorting ?? []) as ExtendedColumnSort<NhanhVnOrder>[],
      columnPinning: { right: ['actions'] }
    },
    getRowId: (row) => row.info.id,
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
        <DataTable
          table={table}
          isLoading={isLoadingNhanhVnOrders}
          renderSubComponent={({ row }) => <NhanhVnProductsSubRow row={row} />}
        >
          <div className='flex w-full items-center justify-between gap-2 p-1'>
            <div className='flex flex-wrap items-center gap-2'>
              <div className='relative'>
                <UserIcon className='pointer-events-none absolute inset-y-0 left-3 flex size-4 translate-y-1/2 items-center text-muted-foreground' />
                <Input
                  placeholder={t('orders.filter.saleName')}
                  value={saleNameInput}
                  onChange={handleSaleNameChange}
                  className='h-7.5 min-w-60 pl-9'
                  spellCheck={false}
                />
              </div>

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
                    setSaleNameInput('')
                    setSaleNameFilter(null)
                    setDateFrom(null)
                    setDateTo(null)
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
