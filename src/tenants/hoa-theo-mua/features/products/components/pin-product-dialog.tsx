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
import { Field, FieldLabel } from '@/components/ui/field'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Spinner } from '@/components/ui/spinner'
import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { FolderPlusIcon } from 'lucide-react'
import { useMemo, useState } from 'react'
import CategoryTreePicker from '../../categories/components/category-tree-picker'
import { useGetSortableCategories } from '../../categories/hooks/use-get-sortable-categories'
import { locateNode } from '../../categories/tree-utils'
import { useGetProduct } from '../hooks/use-get-product'
import { useUpdateProductPins } from '../hooks/use-update-product-pins'
import type { Product } from '../types'

const GLOBAL_KEY = '__global__'

interface PinProductDialogProps {
  product: Product | null
  onOpenChange: (open: boolean) => void
}

export default function PinProductDialog({ product, onOpenChange }: PinProductDialogProps) {
  const { t } = useTenantTranslation()
  const { updateProductPins, isUpdatingProductPins } = useUpdateProductPins()

  // The catalog row lacks the full N:N membership list, so pull the detail (cached) on open.
  const { product: detail, isGettingProduct } = useGetProduct({ id: product?.id ?? '', enabled: !!product })
  const categories = useMemo(() => detail?.categories ?? [], [detail])
  const isLoadingState = isGettingProduct

  // Server truth per target key ('__global__' + each categoryId).
  const current: Record<string, boolean> = { [GLOBAL_KEY]: product?.isPinned ?? false }
  categories.forEach((category) => {
    current[category.categoryId] = category.isPinned
  })

  // Only the user's deviations from server truth are stored; effective = override ?? current.
  const [overrides, setOverrides] = useState<Record<string, boolean>>({})
  // Categories the product isn't in yet, added ad hoc from the picker below. Without these the dialog
  // could only ever reach categories the product already belongs to - leaving no path at all to
  // feature it in a new one.
  const [extraTargets, setExtraTargets] = useState<{ categoryId: string; name: string }[]>([])

  const [syncedId, setSyncedId] = useState(product?.id)
  if (product?.id !== syncedId) {
    setSyncedId(product?.id)
    setOverrides({})
    setExtraTargets([])
  }

  const { sortableCategories, isLoadingSortableCategories } = useGetSortableCategories()

  const effective = (key: string) => overrides[key] ?? current[key] ?? false
  const toggle = (key: string) => {
    const next = !effective(key)
    setOverrides((previous) => ({ ...previous, [key]: next }))
  }

  const memberIds = useMemo(() => new Set(categories.map((category) => category.categoryId)), [categories])

  const addExtraTarget = (categoryId: string | null) => {
    if (!categoryId || memberIds.has(categoryId)) return
    if (extraTargets.some((target) => target.categoryId === categoryId)) return

    const found = locateNode(sortableCategories, categoryId)
    if (!found) return

    setExtraTargets((previous) => [...previous, { categoryId, name: found.node.name }])
    setOverrides((previous) => ({ ...previous, [categoryId]: true }))
  }

  const targets = [
    { key: GLOBAL_KEY, label: t('products.pinDialog.global') },
    ...categories.map((category) => ({ key: category.categoryId, label: category.name })),
    ...extraTargets.map((target) => ({ key: target.categoryId, label: target.name }))
  ]

  const extraIds = useMemo(() => new Set(extraTargets.map((target) => target.categoryId)), [extraTargets])

  const isAllSelected = targets.every((target) => effective(target.key))
  const isSomeSelected = targets.some((target) => effective(target.key))
  const toggleAll = () => {
    const next = !isAllSelected
    setOverrides((previous) => {
      const updated = { ...previous }
      targets.forEach((target) => {
        updated[target.key] = next
      })
      return updated
    })
  }

  const handleApply = () => {
    if (!product) return

    const changes = targets
      .filter((target) => effective(target.key) !== (current[target.key] ?? false))
      .map((target) => ({
        categoryId: target.key === GLOBAL_KEY ? undefined : target.key,
        isPin: effective(target.key),
        // Ad-hoc targets need the product ↔ category link created before the pin can write its row.
        requiresMembership: extraIds.has(target.key)
      }))

    if (changes.length === 0) {
      onOpenChange(false)
      return
    }

    updateProductPins({ productId: product.id, changes }, { onSuccess: () => onOpenChange(false) })
  }

  return (
    <Dialog open={!!product} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-md' position='top-center'>
        <DialogHeader>
          <DialogTitle>{t('products.pinDialog.title')}</DialogTitle>
          <DialogDescription>{t('products.pinDialog.description')}</DialogDescription>
        </DialogHeader>

        {isLoadingState ? (
          <div className='space-y-3'>
            <Skeleton className='h-6 w-full' />
            <Skeleton className='h-6 w-2/3' />
          </div>
        ) : (
          <div className='max-h-72 space-y-3 overflow-y-auto'>
            <div className='flex items-center gap-3'>
              <Checkbox
                id='pin-target-global'
                checked={effective(GLOBAL_KEY)}
                onCheckedChange={() => toggle(GLOBAL_KEY)}
              />
              <Label htmlFor='pin-target-global' className='font-normal'>
                {t('products.pinDialog.global')}
              </Label>
            </div>

            {categories.length > 0 || extraTargets.length > 0 ? (
              <>
                <p className='pt-1 text-xs font-medium text-muted-foreground'>
                  {t('products.pinDialog.categoriesLabel')}
                </p>
                {[
                  ...categories.map((category) => ({ ...category, isExtra: false })),
                  ...extraTargets.map((target) => ({ categoryId: target.categoryId, name: target.name, isExtra: true }))
                ].map((category) => (
                  <div key={category.categoryId} className='flex items-center gap-3'>
                    <Checkbox
                      id={`pin-target-${category.categoryId}`}
                      checked={effective(category.categoryId)}
                      onCheckedChange={() => toggle(category.categoryId)}
                    />
                    <Label htmlFor={`pin-target-${category.categoryId}`} className='font-normal'>
                      {category.name}
                    </Label>
                    {category.isExtra && (
                      <span className='rounded-md border px-1.5 py-0.5 text-[10px] text-muted-foreground'>
                        {t('products.pinDialog.willJoinCategory')}
                      </span>
                    )}
                  </div>
                ))}
              </>
            ) : (
              <p className='text-xs text-muted-foreground'>{t('products.pinDialog.noCategories')}</p>
            )}

            <div className='space-y-1.5 pt-1'>
              <p className='flex items-center gap-1.5 text-xs font-medium text-muted-foreground'>
                <FolderPlusIcon className='size-3.5' />
                {t('products.pinDialog.addCategory')}
              </p>
              <CategoryTreePicker
                categories={sortableCategories}
                value={null}
                onChange={addExtraTarget}
                t={t}
                isLoading={isLoadingSortableCategories}
                emptyLabel={t('products.pinned.categoryFilter.empty')}
                excludeIds={new Set([...memberIds, ...extraIds])}
              />
              <p className='text-xs text-muted-foreground'>{t('products.pinDialog.addCategoryHint')}</p>
            </div>

            {targets.length > 1 && (
              <Field orientation='horizontal' className='items-center justify-between rounded-lg border p-3'>
                <div className='space-y-0.5'>
                  <FieldLabel htmlFor='pin-target-select-all'>{t('products.pinDialog.selectAll')}</FieldLabel>
                  <p className='text-xs text-muted-foreground'>{t('products.pinDialog.selectAllHint')}</p>
                </div>
                <Checkbox
                  id='pin-target-select-all'
                  checked={isAllSelected || (isSomeSelected && 'indeterminate')}
                  onCheckedChange={toggleAll}
                />
              </Field>
            )}
          </div>
        )}

        <DialogFooter>
          <Button variant='outline' onClick={() => onOpenChange(false)} disabled={isUpdatingProductPins}>
            {t('products.pinDialog.cancel')}
          </Button>
          <Button onClick={handleApply} disabled={isUpdatingProductPins || isLoadingState}>
            {isUpdatingProductPins ? <Spinner className='size-4' /> : null}
            {t('products.pinDialog.apply')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
