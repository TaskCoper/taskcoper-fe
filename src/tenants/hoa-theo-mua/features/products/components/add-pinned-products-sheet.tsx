import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Spinner } from '@/components/ui/spinner'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { PinIcon, SearchIcon } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useInView } from 'react-intersection-observer'
import { useDebounce } from 'use-debounce'
import { useBulkPinProducts, type BulkPinCandidate } from '../hooks/use-bulk-pin-products'
import { useGetProductsInfinite } from '../hooks/use-get-products-infinite'
import type { Product } from '../types'
import { formatPrice, parseNumber } from '../utils'
import { ProductPickerRow } from './product-picker-row'

/** Guards against a runaway selection turning into hundreds of sequential PUTs. */
const MAX_BULK_PIN = 32

interface AddPinnedProductsSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** `undefined` = the global / storefront scope. */
  categoryId?: string
  categoryName?: string
  /** Products already pinned in this scope - sourced from the board's (optimistic) pinned cache. */
  pinnedIds: Set<string>
}

/**
 * Pin products into the scope the board is currently showing, without leaving the page.
 *
 * A sheet rather than a dialog: full viewport height fits roughly twice the rows, which is what makes
 * infinite scroll worth having, and it stays open after a successful batch so curating a storefront
 * is one open plus one submit instead of a round trip per product.
 */
export default function AddPinnedProductsSheet({
  open,
  onOpenChange,
  categoryId,
  categoryName,
  pinnedIds
}: AddPinnedProductsSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side='right' className='w-full gap-0 p-0 sm:max-w-2xl'>
        {/* Keyed on the scope so every piece of picker state resets when the board's scope changes. */}
        <AddPinnedProductsBody
          key={categoryId ?? 'global'}
          categoryId={categoryId}
          categoryName={categoryName}
          pinnedIds={pinnedIds}
        />
      </SheetContent>
    </Sheet>
  )
}

type ProductSource = 'category' | 'all'

interface AddPinnedProductsBodyProps {
  categoryId?: string
  categoryName?: string
  pinnedIds: Set<string>
}

function AddPinnedProductsBody({ categoryId, categoryName, pinnedIds }: AddPinnedProductsBodyProps) {
  const { t } = useTenantTranslation()

  const [filter, setFilter] = useState('')
  const [debouncedFilter] = useDebounce(filter.trim(), 300)
  const [source, setSource] = useState<ProductSource>(categoryId ? 'category' : 'all')
  const [selected, setSelected] = useState<Map<string, Product>>(new Map())

  const { bulkPinProducts, isBulkPinningProducts } = useBulkPinProducts(categoryId)

  const { products, totalCount, isGettingProducts, isFetchingNextPage, hasNextPage, fetchNextPage } =
    useGetProductsInfinite({
      search: debouncedFilter || undefined,
      categoryIds: source === 'category' && categoryId ? [categoryId] : undefined
    })

  const { ref: sentinelRef, inView } = useInView({ threshold: 0.1 })

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) fetchNextPage()
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage])

  const isMember = (product: Product) =>
    !categoryId || product.categories.some((category) => category.categoryId === categoryId)

  const toggle = (product: Product, checked: boolean) => {
    setSelected((current) => {
      const next = new Map(current)
      if (checked) next.set(product.id, product)
      else next.delete(product.id)

      return next
    })
  }

  const handleSubmit = () => {
    const picked = [...selected.values()]
    if (picked.length === 0) return

    const candidates: BulkPinCandidate[] = picked.map((product) => ({
      productId: product.id,
      productCode: product.productCode,
      productName: product.productName,
      coverImage: product.coverImage,
      price: parseNumber(product.priceWithVatRaw ?? product.priceRaw),
      oldPrice: parseNumber(product.oldPriceRaw)
    }))

    const assignProductIds = picked.filter((product) => !isMember(product)).map((product) => product.id)

    bulkPinProducts(
      { candidates, assignProductIds: assignProductIds.length ? assignProductIds : undefined },
      // Clear the selection but leave the sheet open - the rows just pinned flip to "already pinned"
      // on the next render because `pinnedIds` reads the optimistically-updated board cache.
      { onSuccess: () => setSelected(new Map()) }
    )
  }

  const selectedCount = selected.size
  const isOverLimit = selectedCount > MAX_BULK_PIN

  return (
    <>
      <SheetHeader className='border-b'>
        <SheetTitle>{t('products.pinned.add.title')}</SheetTitle>
        <SheetDescription>
          {categoryId && categoryName
            ? t('products.pinned.add.descriptionCategory', { name: categoryName })
            : t('products.pinned.add.descriptionGlobal')}
        </SheetDescription>
      </SheetHeader>

      <div className='flex min-h-0 flex-1 flex-col gap-3 p-4'>
        <div className='relative'>
          <SearchIcon className='absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground' />
          <Input
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
            placeholder={t('products.pinned.add.searchPlaceholder')}
            className='pl-8'
          />
        </div>

        {categoryId && (
          <div className='space-y-2'>
            <Tabs value={source} onValueChange={(value) => setSource(value as ProductSource)}>
              <TabsList className='w-full'>
                <TabsTrigger value='category' className='flex-1'>
                  {t('products.pinned.add.sourceCategory')}
                </TabsTrigger>
                <TabsTrigger value='all' className='flex-1'>
                  {t('products.pinned.add.sourceAll')}
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {source === 'all' && (
              <p className='text-xs text-muted-foreground'>
                {t('products.pinned.add.sourceAllHint', { name: categoryName ?? '' })}
              </p>
            )}
          </div>
        )}

        <div className='flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border'>
          {isGettingProducts ? (
            <div className='flex flex-1 items-center justify-center'>
              <Spinner />
            </div>
          ) : products.length === 0 ? (
            <div className='flex flex-1 items-center justify-center px-4 text-center text-sm text-muted-foreground'>
              {t('products.pinned.add.noProducts')}
            </div>
          ) : (
            <ScrollArea className='min-h-0 flex-1'>
              <ul className='divide-y'>
                {products.map((product) => {
                  const isPinned = pinnedIds.has(product.id)

                  return (
                    <li key={product.id}>
                      <ProductPickerRow
                        t={t}
                        productName={product.productName}
                        productCode={product.productCode}
                        coverImage={product.coverImage}
                        price={formatPrice(product.priceWithVatRaw ?? product.priceRaw)}
                        checked={isPinned || selected.has(product.id)}
                        disabled={isPinned}
                        onCheckedChange={(checked) => toggle(product, checked)}
                        badge={
                          isPinned ? (
                            <Badge variant='secondary' className='shrink-0'>
                              {t('products.pinned.add.alreadyPinned')}
                            </Badge>
                          ) : !isMember(product) ? (
                            <Badge variant='outline' className='shrink-0'>
                              {t('products.pinned.add.notInCategory')}
                            </Badge>
                          ) : null
                        }
                      />
                    </li>
                  )
                })}
              </ul>

              {hasNextPage ? (
                <div ref={sentinelRef} className='flex justify-center py-3'>
                  {isFetchingNextPage && <Spinner className='size-4' />}
                </div>
              ) : (
                <p className='py-3 text-center text-xs text-muted-foreground'>
                  {t('products.pinned.add.endOfList', { count: totalCount })}
                </p>
              )}
            </ScrollArea>
          )}
        </div>

        {isOverLimit && (
          <p className='text-xs text-destructive'>{t('products.pinned.add.limitReached', { count: MAX_BULK_PIN })}</p>
        )}
      </div>

      <SheetFooter className='flex-row items-center justify-between border-t'>
        {selectedCount > 0 && (
          <Button type='button' variant='destructive' size='sm' onClick={() => setSelected(new Map())}>
            {t('products.pinned.add.clearSelection')} ({selectedCount})
          </Button>
        )}

        <Button
          type='button'
          disabled={selectedCount === 0 || isOverLimit || isBulkPinningProducts}
          onClick={handleSubmit}
        >
          {isBulkPinningProducts ? <Spinner data-icon='inline-start' /> : <PinIcon data-icon='inline-start' />}
          {selectedCount > 0
            ? t('products.pinned.add.submit', { count: selectedCount })
            : t('products.pinned.add.submitEmpty')}
        </Button>
      </SheetFooter>
    </>
  )
}
