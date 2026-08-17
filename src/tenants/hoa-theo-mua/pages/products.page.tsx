import { DataTable } from '@/components/data-table/data-table'
import { DataTableToolbar } from '@/components/data-table/data-table-toolbar'
import { useDataTable } from '@/hooks/use-data-table'
import { useTableQueryParams } from '@/hooks/use-table-query-params'
import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import type { RangeValue } from '@/types/data-table.type'
import { parseAsArrayOf, parseAsBoolean, parseAsString, useQueryState } from 'nuqs'
import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router'
import PinProductDialog from '../features/products/components/pin-product-dialog'
import { getProductColumns } from '../features/products/components/product-columns'
import { useGetMaxPriceProduct } from '../features/products/hooks/use-get-max-price-product'
import { useGetProducts } from '../features/products/hooks/use-get-products'
import type { Product } from '../features/products/types'

export default function ProductsPage() {
  const { t } = useTenantTranslation()
  const { maxPrice } = useGetMaxPriceProduct()
  const [searchParams] = useSearchParams()

  const [pinTarget, setPinTarget] = useState<Product | null>(null)

  const columns = useMemo(
    () =>
      getProductColumns({
        t,
        onTogglePin: (product) => setPinTarget(product)
      }),
    [t]
  )

  const filterOptionOverrides = useMemo(() => {
    const overrides: Record<string, RangeValue> = {}
    if (maxPrice && maxPrice > 0) {
      overrides.price = [0, maxPrice]
    }

    return overrides
  }, [maxPrice])

  const { page, limit } = useTableQueryParams({ columns, prefix: 'products' })

  const [priceFilter] = useQueryState('products_price', parseAsArrayOf(parseAsString, ','))
  const [searchFilter] = useQueryState('products_product', parseAsString)
  const [categoriesFilter] = useQueryState('products_categories', parseAsArrayOf(parseAsString, ','))
  const [isPinFilter] = useQueryState('products_isPinned', parseAsBoolean)
  const [legacyTagFilter] = useQueryState('products_tag', parseAsString)

  // The table stores the product-type filter under its column id; the API calls it `tag`.
  const tag = searchParams.get('products_productType') ?? legacyTagFilter ?? undefined
  const priceFrom = priceFilter?.[0] ? Number(priceFilter[0]) : undefined
  const priceTo = priceFilter?.[1] ? Number(priceFilter[1]) : undefined
  const search = searchFilter ?? undefined
  const categoryIds = categoriesFilter?.length ? categoriesFilter : undefined
  const isPin = isPinFilter ?? undefined

  const { products, isGettingProducts } = useGetProducts({
    pageIndex: page,
    pageSize: limit,
    search,
    categoryIds,
    priceFrom: Number.isFinite(priceFrom) ? priceFrom : undefined,
    priceTo: Number.isFinite(priceTo) ? priceTo : undefined,
    isPin,
    tag
  })

  const items = products?.value.items ?? []
  const totalCount = products?.value.totalCount ?? 0

  const { table } = useDataTable({
    data: items,
    columns,
    pageCount: Math.ceil(totalCount / limit) || 1,
    initialState: {
      columnPinning: { right: ['actions'] },
      // Filters render in column-definition order (isPinned after the product search input); this
      // reorders the table display only, so isPinned still sits first, right after the checkbox.
      columnOrder: ['select', 'isPinned'],
      columnVisibility: {
        supplier: false,
        productType: false,
        barcode: false,
        // Keep only the headline `price` visible; the granular price/VAT fields are opt-in.
        priceWithVat: false,
        oldPrice: false,
        branchPrice: false,
        branchPriceWithVat: false,
        importPrice: false,
        importVat: false,
        importPriceWithVat: false,
        wholesalePrice: false,
        wholesalePriceWithVat: false,
        wholesaleBranchPrice: false,
        wholesaleBranchPriceWithVat: false,
        costPrice: false,
        vat: false,
        profitPercentage: false,
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
          <DataTableToolbar table={table} filterOptionOverrides={filterOptionOverrides} />
        </DataTable>
      </div>

      <PinProductDialog
        product={pinTarget}
        onOpenChange={(open) => {
          if (!open) setPinTarget(null)
        }}
      />
    </div>
  )
}
