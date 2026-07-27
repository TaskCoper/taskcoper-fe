import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Spinner } from '@/components/ui/spinner'
import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { DEFAULT_PAGE_INDEX } from '@/shared/constants'
import { cn } from '@/shared/utils'
import { ChevronLeftIcon, ChevronRightIcon, ImageIcon, SaveIcon, SearchIcon } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useGetProducts } from '../../products/hooks/use-get-products'
import { formatPrice } from '../../products/utils'
import { useAssignProducts } from '../hooks/use-assign-products'
import { useGetCategory } from '../hooks/use-get-category'
import type { Category } from '../types'

const ASSIGN_PREFIX = 'productCategories.assign' as const
const PAGE_SIZE = 10

interface AssignProductsDialogProps {
  open: boolean
  category: Category | null
  onOpenChange: (open: boolean) => void
}

export default function AssignProductsDialog({ open, category, onOpenChange }: AssignProductsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-2xl' position='top-center'>
        {category && <AssignProductsBody key={category.categoryId} category={category} onOpenChange={onOpenChange} />}
      </DialogContent>
    </Dialog>
  )
}

interface AssignProductsBodyProps {
  category: Category
  onOpenChange: (open: boolean) => void
}

function AssignProductsBody({ category, onOpenChange }: AssignProductsBodyProps) {
  const { t } = useTenantTranslation()
  const [page, setPage] = useState(DEFAULT_PAGE_INDEX)
  const [filter, setFilter] = useState('')

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  // Detail endpoint is the only source of the category's current productIds (§4.2).
  const { category: detail, isFetching: isLoadingDetail } = useGetCategory(category.categoryId)
  const { products, isGettingProducts } = useGetProducts({ pageIndex: page, pageSize: PAGE_SIZE })

  const [seeded, setSeeded] = useState(false)
  if (detail && !seeded) {
    setSeeded(true)
    setSelectedIds(new Set(detail.productIds ?? []))
  }

  const totalCount = products?.value.totalCount ?? 0
  const pageCount = Math.max(1, Math.ceil(totalCount / PAGE_SIZE))

  // Filter on client
  const visibleItems = useMemo(() => {
    const items = products?.value.items ?? []
    const keyword = filter.trim().toLowerCase()
    if (!keyword) return items

    return items.filter((product) =>
      [product.productName, product.productCode].some((value) => value?.toLowerCase().includes(keyword))
    )
  }, [products, filter])

  const { assignProducts, isAssigningProducts } = useAssignProducts({
    onAssignSuccess: () => onOpenChange(false)
  })

  const toggleProduct = (id: string, checked: boolean) => {
    setSelectedIds((current) => {
      const next = new Set(current)
      if (checked) next.add(id)
      else next.delete(id)
      return next
    })
  }

  const handleSubmit = () => {
    assignProducts({ id: category.categoryId, body: { productIds: [...selectedIds] } })
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>{t(`${ASSIGN_PREFIX}.title`)}</DialogTitle>
        <DialogDescription>
          {category.name
            ? t(`${ASSIGN_PREFIX}.descriptionNamed`, { name: category.name })
            : t(`${ASSIGN_PREFIX}.description`)}
        </DialogDescription>
      </DialogHeader>

      <div className='space-y-3'>
        <div className='flex items-center justify-between gap-3'>
          <div className='relative flex-1'>
            <SearchIcon className='absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground' />
            <Input
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
              placeholder={t(`${ASSIGN_PREFIX}.searchPlaceholder`)}
              className='pl-8'
            />
          </div>
          <span className='shrink-0 text-sm text-muted-foreground'>
            {t(`${ASSIGN_PREFIX}.selectedCount`, { count: selectedIds.size })}
          </span>
        </div>

        <ScrollArea className='h-80 rounded-lg border'>
          {isGettingProducts || isLoadingDetail ? (
            <div className='flex h-80 items-center justify-center'>
              <Spinner />
            </div>
          ) : visibleItems.length === 0 ? (
            <div className='flex h-80 items-center justify-center text-sm text-muted-foreground'>
              {t(`${ASSIGN_PREFIX}.noProducts`)}
            </div>
          ) : (
            <ul className='divide-y'>
              {visibleItems.map((product) => {
                const checked = selectedIds.has(product.id)
                const price = formatPrice(product.priceWithVatRaw ?? product.priceRaw)

                return (
                  <li key={product.id}>
                    <label
                      className={cn(
                        'flex cursor-pointer items-center gap-3 px-3 py-2.5 transition-colors hover:bg-accent',
                        checked && 'bg-primary/5'
                      )}
                    >
                      <Checkbox checked={checked} onCheckedChange={(value) => toggleProduct(product.id, !!value)} />
                      <span className='flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-md border bg-muted'>
                        {product.coverImage ? (
                          <img
                            src={product.coverImage}
                            alt={product.productName ?? ''}
                            loading='lazy'
                            className='size-full object-cover'
                          />
                        ) : (
                          <ImageIcon className='size-4 text-muted-foreground/40' />
                        )}
                      </span>
                      <span className='min-w-0 flex-1'>
                        <span className='block truncate text-sm font-medium'>
                          {product.productName?.trim() || t('products.common.unnamed')}
                        </span>
                        {product.productCode?.trim() && (
                          <span className='block truncate font-mono text-xs text-muted-foreground'>
                            {product.productCode}
                          </span>
                        )}
                      </span>
                      {price && (
                        <span className='shrink-0 text-sm font-medium text-emerald-600 dark:text-emerald-400'>
                          {price}
                        </span>
                      )}
                    </label>
                  </li>
                )
              })}
            </ul>
          )}
        </ScrollArea>

        <div className='flex items-center justify-between'>
          <span className='text-xs text-muted-foreground'>{t(`${ASSIGN_PREFIX}.pageInfo`, { page, pageCount })}</span>
          <div className='flex items-center gap-2'>
            <Button
              type='button'
              variant='outline'
              size='sm'
              disabled={page <= 1 || isGettingProducts}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
            >
              <ChevronLeftIcon className='size-4' />
              {t('common.button.previous')}
            </Button>
            <Button
              type='button'
              variant='outline'
              size='sm'
              disabled={page >= pageCount || isGettingProducts}
              onClick={() => setPage((current) => Math.min(pageCount, current + 1))}
            >
              {t('common.button.next')}
              <ChevronRightIcon className='size-4' />
            </Button>
          </div>
        </div>
      </div>

      <DialogFooter>
        <Button type='button' variant='outline' disabled={isAssigningProducts} onClick={() => onOpenChange(false)}>
          {t('common.button.cancel')}
        </Button>

        <Button type='button' disabled={isAssigningProducts || isLoadingDetail} onClick={handleSubmit}>
          {isAssigningProducts ? <Spinner data-icon='inline-start' /> : <SaveIcon data-icon='inline-start' />}
          {t(`${ASSIGN_PREFIX}.submit`)}
        </Button>
      </DialogFooter>
    </>
  )
}
