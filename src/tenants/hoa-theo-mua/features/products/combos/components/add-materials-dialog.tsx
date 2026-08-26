import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious
} from '@/components/ui/pagination'
import { Skeleton } from '@/components/ui/skeleton'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { TenantT } from '@/lib/i18n/use-tenant-translation'
import { ListFilterIcon, PlusIcon, SearchIcon, TriangleAlertIcon } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useFieldArray, useForm, useWatch } from 'react-hook-form'
import { useDebounce } from 'use-debounce'
import type { ComboMaterial, MaterialOption, MaterialProductLabel } from '../types'
import { createComboMaterialsSchema, type ComboMaterialsFormValues } from '../validations'
import { useAddComboSpecificationItems } from '../hooks/use-add-combo-specification-items'
import { useGetMaterials } from '../hooks/use-get-materials'
import { SelectedMaterialCard } from './selected-material-card'
import type { MaterialDraft } from './selected-material-card'

const MAX_COMBO_MATERIALS = 15
const MATERIALS_PAGE_SIZE = 10
type MaterialRoleTab = 'core' | 'support'

export function AddMaterialsDialog({
  open,
  onOpenChange,
  comboId,
  existingMaterials,
  t
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  comboId: string
  existingMaterials: ComboMaterial[]
  t: TenantT
}) {
  const [search, setSearch] = useState('')
  const [productLabel, setProductLabel] = useState<MaterialProductLabel>()
  const [selectedMaterialDetails, setSelectedMaterialDetails] = useState<Record<string, MaterialOption>>({})
  const [materialsPageIndex, setMaterialsPageIndex] = useState(1)
  const [activeRoleTab, setActiveRoleTab] = useState<MaterialRoleTab>('core')
  const [debouncedSearch] = useDebounce(search.trim(), 500)
  const materialsSchema = useMemo(() => createComboMaterialsSchema(t), [t])
  const materialsForm = useForm<ComboMaterialsFormValues>({
    resolver: zodResolver(materialsSchema),
    defaultValues: { items: [] },
    mode: 'onChange'
  })
  const {
    fields: materialFields,
    append: appendMaterial,
    remove: removeMaterial
  } = useFieldArray({
    control: materialsForm.control,
    name: 'items'
  })
  const selectedItems = useWatch({ control: materialsForm.control, name: 'items' })
  const drafts = useMemo<MaterialDraft[]>(
    () =>
      selectedItems.map((item) => {
        const material = selectedMaterialDetails[item.matId]

        return {
          ...item,
          materialCode: material?.materialCode ?? '',
          materialName: material?.materialName ?? item.matId,
          coverImage: material?.coverImage,
          unit: material?.unit ?? null
        }
      }),
    [selectedItems, selectedMaterialDetails]
  )
  const quantityErrors = Object.fromEntries(
    materialFields.map((field, index) => [
      field.matId,
      materialsForm.formState.errors.items?.[index]?.quantity?.message
    ])
  )
  const existingMaterialIds = useMemo(
    () => existingMaterials.map((material) => material.materialId),
    [existingMaterials]
  )
  const {
    materialsPage: materialsResult,
    materials,
    isGettingMaterials
  } = useGetMaterials({
    search: debouncedSearch || undefined,
    productLabel,
    excludeIds: existingMaterialIds,
    pageIndex: materialsPageIndex,
    pageSize: MATERIALS_PAGE_SIZE,
    enabled: open
  })
  const { addComboSpecificationItems, isAddingComboSpecificationItems } = useAddComboSpecificationItems()
  const totalPages = Math.ceil((materialsResult?.totalCount ?? 0) / (materialsResult?.pageSize || MATERIALS_PAGE_SIZE))
  const currentMaterialsPage = Math.min(materialsPageIndex, Math.max(totalPages, 1))
  const coreDrafts = drafts.filter((draft) => draft.isCore)
  const supportDrafts = drafts.filter((draft) => !draft.isCore)
  const selectedMaterialCount = drafts.length + existingMaterials.length

  const toggleMaterial = (material: MaterialOption, checked: boolean) => {
    const index = selectedItems.findIndex((item) => item.matId === material.materialId)

    if (checked) {
      if (index >= 0) return

      setSelectedMaterialDetails((current) => ({ ...current, [material.materialId]: material }))
      appendMaterial({
        matId: material.materialId,
        quantity: 1,
        isCore: activeRoleTab === 'core',
        isActive: true
      })
      return
    }

    if (index < 0) return
    removeMaterial(index)
    setSelectedMaterialDetails((current) => {
      const next = { ...current }
      delete next[material.materialId]
      return next
    })
  }
  const removeDraft = (matId: string) => {
    const index = selectedItems.findIndex((item) => item.matId === matId)
    if (index < 0) return

    removeMaterial(index)
    setSelectedMaterialDetails((current) => {
      const next = { ...current }
      delete next[matId]
      return next
    })
  }
  const updateDraft = (matId: string, updates: Partial<MaterialDraft>) => {
    const index = selectedItems.findIndex((item) => item.matId === matId)
    if (index < 0) return

    if ('quantity' in updates) {
      materialsForm.setValue(`items.${index}.quantity`, updates.quantity ?? Number.NaN, {
        shouldDirty: true,
        shouldValidate: true
      })
    }
    if ('isCore' in updates) {
      materialsForm.setValue(`items.${index}.isCore`, updates.isCore ?? false, {
        shouldDirty: true,
        shouldValidate: true
      })
    }
  }
  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen && !isAddingComboSpecificationItems) {
      materialsForm.reset({ items: [] })
      setSelectedMaterialDetails({})
      setSearch('')
      setProductLabel(undefined)
      setMaterialsPageIndex(1)
      setActiveRoleTab('core')
    }
    onOpenChange(nextOpen)
  }
  const handleSave = async ({ items }: ComboMaterialsFormValues) => {
    await addComboSpecificationItems({
      comboId,
      body: { items }
    })
    handleOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className='w-[90vw] sm:max-w-6xl' position='top-center'>
        <DialogHeader>
          <DialogTitle>{t('products.detail.comboSpecification.addTitle')}</DialogTitle>
          <DialogDescription>{t('products.detail.comboSpecification.addDescription')}</DialogDescription>
        </DialogHeader>
        <div className='grid min-h-[45vh] max-h-[75vh] items-stretch gap-4 md:grid-cols-2'>
          <section className='flex h-full min-h-0 min-w-0 flex-col space-y-3 rounded-lg border p-3'>
            <h3 className='text-sm font-semibold'>{t('products.detail.comboSpecification.availableMaterials')}</h3>
            <div className='flex gap-2'>
              <div className='relative min-w-0 flex-1'>
                <SearchIcon className='absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground' />
                <Input
                  value={search}
                  onChange={(event) => {
                    setSearch(event.target.value)
                    setMaterialsPageIndex(1)
                  }}
                  placeholder={t('products.detail.comboSpecification.searchMaterial')}
                  className='pl-9'
                />
              </div>
              <Select
                value={productLabel ?? 'all'}
                onValueChange={(value) => {
                  if (value === 'all') {
                    setProductLabel(undefined)
                    setMaterialsPageIndex(1)
                    return
                  }
                  if (value !== 'Thành phần' && value !== 'Phụ liệu') return
                  setProductLabel(value)
                  setMaterialsPageIndex(1)
                }}
              >
                <SelectTrigger
                  className='w-38 shrink-0 justify-start'
                  aria-label={t('products.detail.comboSpecification.materialTypeFilter')}
                >
                  <ListFilterIcon />
                  <SelectValue placeholder={t('products.detail.comboSpecification.materialTypePlaceholder')} />
                  <div className='flex-1' />
                </SelectTrigger>
                <SelectContent align='end'>
                  <SelectItem value='all'>{t('products.detail.comboSpecification.allMaterialTypes')}</SelectItem>
                  <SelectItem value='Thành phần'>
                    {t('products.detail.comboSpecification.materialProductLabel')}
                  </SelectItem>
                  <SelectItem value='Phụ liệu'>
                    {t('products.detail.comboSpecification.accessoryProductLabel')}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className='min-h-0 flex-1 overflow-y-auto rounded-lg border'>
              {isGettingMaterials ? (
                <div className='space-y-2 p-4'>
                  {[1, 2, 3].map((row) => (
                    <Skeleton key={row} className='h-12 w-full' />
                  ))}
                </div>
              ) : materials.length === 0 ? (
                <div className='py-8 text-center text-sm text-muted-foreground'>
                  {t('products.detail.comboSpecification.noMaterials')}
                </div>
              ) : (
                materials.map((material) => (
                  <label
                    key={material.materialId}
                    className='flex cursor-pointer items-center gap-3 border-b p-3 last:border-b-0'
                  >
                    <Checkbox
                      checked={selectedItems.some((item) => item.matId === material.materialId)}
                      onCheckedChange={(checked) => toggleMaterial(material, checked === true)}
                      aria-label={material.materialName}
                    />
                    <MaterialImage src={material.coverImage} alt={material.materialName} />
                    <div className='min-w-0 flex-1'>
                      <div className='flex justify-between items-center gap-2'>
                        <p className='min-w-0 truncate text-sm font-medium'>{material.materialName}</p>
                        {material.availableForSale === 0 && (
                          <Badge
                            variant='outline'
                            className='shrink-0 border-amber-200 bg-amber-50 text-[10px] text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-300'
                          >
                            {t('products.detail.outOfStock')}
                          </Badge>
                        )}
                      </div>
                      <p className='truncate text-xs text-muted-foreground'>
                        {material.materialCode} · {material.unit || t('products.common.noData')} ·{' '}
                        {t('products.detail.comboSpecification.stock')}:{' '}
                        {material.availableForSale ?? t('products.common.noData')}
                      </p>
                    </div>
                  </label>
                ))
              )}
            </div>
            {totalPages > 1 && (
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href='#'
                      aria-label={t('dataTable.pagination.goToPreviousPage')}
                      aria-disabled={currentMaterialsPage === 1 || isGettingMaterials}
                      className={
                        currentMaterialsPage === 1 || isGettingMaterials ? 'pointer-events-none opacity-50' : undefined
                      }
                      onClick={(event) => {
                        event.preventDefault()
                        setMaterialsPageIndex((current) => Math.max(1, current - 1))
                      }}
                    />
                  </PaginationItem>
                  {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
                    <PaginationItem key={page}>
                      <PaginationLink
                        href='#'
                        isActive={page === currentMaterialsPage}
                        aria-label={`Go to page ${page}`}
                        onClick={(event) => {
                          event.preventDefault()
                          if (!isGettingMaterials) setMaterialsPageIndex(page)
                        }}
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  <PaginationItem>
                    <PaginationNext
                      href='#'
                      aria-label={t('dataTable.pagination.goToNextPage')}
                      aria-disabled={currentMaterialsPage === totalPages || isGettingMaterials}
                      className={
                        currentMaterialsPage === totalPages || isGettingMaterials
                          ? 'pointer-events-none opacity-50'
                          : undefined
                      }
                      onClick={(event) => {
                        event.preventDefault()
                        setMaterialsPageIndex((current) => Math.min(totalPages, current + 1))
                      }}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </section>
          <section className='flex h-full min-h-0 min-w-0 flex-col space-y-3 rounded-lg border p-3'>
            <div className='flex items-center justify-between'>
              <h3 className='text-sm font-semibold'>{t('products.detail.comboSpecification.selectedMaterials')}</h3>
              <Badge variant='outline'>{selectedMaterialCount}</Badge>
            </div>
            {selectedMaterialCount >= MAX_COMBO_MATERIALS && (
              <div
                role='alert'
                className='flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-300'
              >
                <TriangleAlertIcon className='mt-0.5 size-4 shrink-0' aria-hidden='true' />
                <p className='text-xs font-medium leading-relaxed'>
                  {t('products.detail.comboSpecification.materialLimitWarning', { count: MAX_COMBO_MATERIALS })}
                </p>
              </div>
            )}
            <Tabs
              value={activeRoleTab}
              onValueChange={(value) => {
                if (value === 'core' || value === 'support') setActiveRoleTab(value)
              }}
              className='min-h-0 flex-1'
            >
              <TabsList className='w-full'>
                <TabsTrigger value='core'>
                  {t('products.detail.comboSpecification.core')} ({coreDrafts.length})
                </TabsTrigger>
                <TabsTrigger value='support'>
                  {t('products.detail.comboSpecification.support')} ({supportDrafts.length})
                </TabsTrigger>
              </TabsList>
              <TabsContent value='core' className='min-h-0 flex-1 overflow-y-auto'>
                {coreDrafts.length === 0 ? (
                  <div className='rounded-lg border border-dashed py-12 text-center text-sm text-muted-foreground'>
                    {t('products.detail.comboSpecification.noSelectedMaterials')}
                  </div>
                ) : (
                  <DraftGroup
                    title={t('products.detail.comboSpecification.core')}
                    isCore
                    drafts={coreDrafts}
                    onRemove={removeDraft}
                    onUpdate={updateDraft}
                    quantityErrors={quantityErrors}
                    t={t}
                  />
                )}
              </TabsContent>
              <TabsContent value='support' className='min-h-0 flex-1 overflow-y-auto'>
                {supportDrafts.length === 0 ? (
                  <div className='rounded-lg border border-dashed py-12 text-center text-sm text-muted-foreground'>
                    {t('products.detail.comboSpecification.noSelectedMaterials')}
                  </div>
                ) : (
                  <DraftGroup
                    title={t('products.detail.comboSpecification.support')}
                    isCore={false}
                    drafts={supportDrafts}
                    onRemove={removeDraft}
                    onUpdate={updateDraft}
                    quantityErrors={quantityErrors}
                    t={t}
                  />
                )}
              </TabsContent>
            </Tabs>
          </section>
        </div>
        <DialogFooter>
          <Button
            type='button'
            variant='outline'
            onClick={() => handleOpenChange(false)}
            disabled={isAddingComboSpecificationItems}
          >
            {t('common.button.cancel')}
          </Button>
          <Button
            type='button'
            onClick={() => void materialsForm.handleSubmit(handleSave)()}
            disabled={drafts.length === 0 || isAddingComboSpecificationItems}
          >
            <PlusIcon data-icon='inline-start' />
            {isAddingComboSpecificationItems
              ? t('common.ui.loading')
              : t('products.detail.comboSpecification.addRecipe')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function DraftGroup({
  drafts,
  onRemove,
  onUpdate,
  quantityErrors,
  t
}: {
  title: string
  isCore: boolean
  drafts: MaterialDraft[]
  onRemove: (matId: string) => void
  onUpdate: (matId: string, updates: Partial<MaterialDraft>) => void
  quantityErrors: Record<string, string | undefined>
  t: TenantT
}) {
  return (
    <div className='rounded-lg p-3'>
      <div className='space-y-3'>
        {drafts.length === 0 ? (
          <p className='text-xs text-muted-foreground'>{t('products.detail.comboSpecification.noSelectedMaterials')}</p>
        ) : (
          drafts.map((draft) => (
            <SelectedMaterialCard
              key={draft.matId}
              draft={draft}
              quantityError={quantityErrors[draft.matId]}
              onRemove={onRemove}
              onUpdate={onUpdate}
              t={t}
            />
          ))
        )}
      </div>
    </div>
  )
}

function MaterialImage({ src, alt }: { src?: string | null; alt: string }) {
  return (
    <div className='flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-md border bg-muted/30'>
      <img src={src || '/images/placeholder-cover.png'} alt={alt} className='size-full object-cover' />
    </div>
  )
}
