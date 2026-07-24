import { DataTable } from '@/components/data-table/data-table'
import { DataTableToolbar } from '@/components/data-table/data-table-toolbar'
import { useDataTable } from '@/hooks/use-data-table'
import { useTableQueryParams } from '@/hooks/use-table-query-params'
import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { parseAsArrayOf, parseAsString, useQueryState } from 'nuqs'
import { useMemo } from 'react'
import { useNavigate } from 'react-router'
import { getProductColumns } from '../features/products/components/product-columns'
import { useGetProducts } from '../features/products/hooks/use-get-products'

export default function ProductsListPage() {
  const { t } = useTenantTranslation()
  const navigate = useNavigate()

  const columns = useMemo(
    () =>
      getProductColumns({
        t,
        onViewDetail: (product) => {
          navigate(product.id)
        }
      }),
    [t, navigate]
  )

  const { page, limit } = useTableQueryParams({ columns, prefix: 'products' })

  const [priceFilter] = useQueryState('products_price', parseAsArrayOf(parseAsString, ','))
  const priceFrom = priceFilter?.[0] ? Number(priceFilter[0]) : undefined
  const priceTo = priceFilter?.[1] ? Number(priceFilter[1]) : undefined

  const { products, isGettingProducts } = useGetProducts({
    PageIndex: page,
    PageSize: limit,
    PriceFrom: Number.isFinite(priceFrom) ? priceFrom : undefined,
    PriceTo: Number.isFinite(priceTo) ? priceTo : undefined
  })

  const items = products?.value.items ?? []
  const totalCount = products?.value.totalCount ?? 0

  const { table } = useDataTable({
    data: items,
    columns,
    pageCount: Math.ceil(totalCount / limit) || 1,
    initialState: {
      columnPinning: { left: ['select', 'image', 'product'], right: ['actions'] },
      columnVisibility: {
        supplier: false,
        productType: false,
        barcode: false,
        importPrice: false,
        costPrice: false,
        wholesalePrice: false,
        size: false,
        color: false,
        origin: false,
        createdAt: false
      }
    },
    getRowId: (row) => String(row.nhanhProductId ?? row.sourceRowNumber),
    shallow: false,
    clearOnDefault: true,
    filterPrefix: 'products',
    queryKeys: {
      page: 'products_page',
      perPage: 'products_perPage',
      sort: 'products_sort'
    }
  })

  return (
    <div className='h-full overflow-auto'>
      <div className='space-y-6 p-6'>
        <div className='flex items-center justify-between gap-4'>
          <div>
            <p className='text-2xl font-bold'>{t('products.list.title')}</p>
            <p className='text-sm text-muted-foreground'>{t('products.list.description')}</p>
          </div>
        </div>

        <DataTable table={table} isLoading={isGettingProducts}>
          <DataTableToolbar table={table} />
        </DataTable>
      </div>
    </div>
  )
}
