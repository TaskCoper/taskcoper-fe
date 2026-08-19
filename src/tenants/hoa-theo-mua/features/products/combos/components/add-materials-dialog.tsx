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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { TenantT } from '@/lib/i18n/use-tenant-translation'
import { PlusIcon, SearchIcon } from 'lucide-react'
import { useMemo, useState } from 'react'
import type { ComboMaterial, MaterialOption } from '../types'
import { useAddComboSpecificationItems } from '../hooks/use-add-combo-specification-items'
import { useGetMaterials } from '../hooks/use-get-materials'
import { SelectedMaterialCard } from './selected-material-card'
import type { MaterialDraft } from './selected-material-card'

const MAX_COMBO_MATERIALS = 15
const MATERIALS_PAGE_SIZE = 10

export function AddMaterialsDialog({
  open,
  onOpenChange,
  comboId,
  factor,
  existingMaterials,
  t
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  comboId: string
  factor: number
  existingMaterials: ComboMaterial[]
  t: TenantT
}) {
  const [search, setSearch] = useState('')
  const [drafts, setDrafts] = useState<MaterialDraft[]>([])
  const [materialsPage, setMaterialsPage] = useState(1)
  const { materials, isGettingMaterials } = useGetMaterials({ search, enabled: open })
  const { addComboSpecificationItems, isAddingComboSpecificationItems } = useAddComboSpecificationItems()
  const existingIds = useMemo(
    () => new Set(existingMaterials.map((material) => material.materialId)),
    [existingMaterials]
  )
  const selectableMaterials = materials.filter((material) => !existingIds.has(material.materialId))
  const totalPages = Math.ceil(selectableMaterials.length / MATERIALS_PAGE_SIZE)
  const currentMaterialsPage = Math.min(materialsPage, Math.max(totalPages, 1))
  const paginatedMaterials = selectableMaterials.slice(
    (currentMaterialsPage - 1) * MATERIALS_PAGE_SIZE,
    currentMaterialsPage * MATERIALS_PAGE_SIZE
  )
  const coreDrafts = drafts.filter((draft) => draft.isCore)
  const supportDrafts = drafts.filter((draft) => !draft.isCore)
  const selectedMaterialCount = drafts.length

  const toggleMaterial = (material: MaterialOption, checked: boolean) => {
    setDrafts((current) =>
      checked
        ? current.some((draft) => draft.matId === material.materialId)
          ? current
          : [
              ...current,
              {
                matId: material.materialId,
                materialCode: material.materialCode,
                materialName: material.materialName,
                coverImage: material.coverImage,
                unit: material.unit,
                quantity: 1,
                isCore: true,
                isActive: true
              }
            ]
        : current.filter((draft) => draft.matId !== material.materialId)
    )
  }
  const removeDraft = (matId: string) => setDrafts((current) => current.filter((draft) => draft.matId !== matId))
  const updateDraft = (matId: string, updates: Partial<MaterialDraft>) =>
    setDrafts((current) => current.map((draft) => (draft.matId === matId ? { ...draft, ...updates } : draft)))
  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen && !isAddingComboSpecificationItems) {
      setDrafts([])
      setSearch('')
      setMaterialsPage(1)
    }
    onOpenChange(nextOpen)
  }
  const handleSave = async () => {
    if (drafts.length === 0 || drafts.some((draft) => !Number.isFinite(draft.quantity) || draft.quantity <= 0)) return
    await addComboSpecificationItems({
      comboId,
      body: { items: drafts.map(({ matId, quantity, isCore, isActive }) => ({ matId, quantity, isCore, isActive })) }
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
        <div className='grid h-[75vh] min-h-0 items-stretch gap-4 md:grid-cols-2'>
          <section className='flex h-full min-h-0 min-w-0 flex-col space-y-3 rounded-lg border p-3'>
            <h3 className='text-sm font-semibold'>{t('products.detail.comboSpecification.availableMaterials')}</h3>
            <div className='relative'>
              <SearchIcon className='absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground' />
              <Input
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value)
                  setMaterialsPage(1)
                }}
                placeholder={t('products.detail.comboSpecification.searchMaterial')}
                className='pl-9'
              />
            </div>
            <div className='min-h-0 flex-1 overflow-y-auto rounded-lg border'>
              {isGettingMaterials ? (
                <div className='space-y-2 p-4'>
                  {[1, 2, 3].map((row) => (
                    <Skeleton key={row} className='h-12 w-full' />
                  ))}
                </div>
              ) : selectableMaterials.length === 0 ? (
                <div className='py-8 text-center text-sm text-muted-foreground'>
                  {t('products.detail.comboSpecification.noMaterials')}
                </div>
              ) : (
                paginatedMaterials.map((material) => (
                  <label
                    key={material.materialId}
                    className='flex cursor-pointer items-center gap-3 border-b p-3 last:border-b-0'
                  >
                    <Checkbox
                      checked={drafts.some((draft) => draft.matId === material.materialId)}
                      onCheckedChange={(checked) => toggleMaterial(material, checked === true)}
                      aria-label={material.materialName}
                    />
                    <MaterialImage
                      src={material.coverImage}
                      alt={material.materialName}
                      emptyLabel={t('products.common.noData')}
                    />
                    <div className='min-w-0 flex-1'>
                      <p className='truncate text-sm font-medium'>{material.materialName}</p>
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
                        setMaterialsPage((current) => Math.max(1, current - 1))
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
                          if (!isGettingMaterials) setMaterialsPage(page)
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
                        setMaterialsPage((current) => Math.min(totalPages, current + 1))
                      }}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </section>
          <section className='flex h-full min-h-0 min-w-0 flex-col space-y-3 rounded-lg border p-3'>
            <div className='flex items-center justify-between '>
              <h3 className='text-sm font-semibold'>{t('products.detail.comboSpecification.selectedMaterials')}</h3>
              <Badge variant='outline'>{selectedMaterialCount}</Badge>
            </div>
            {selectedMaterialCount >= MAX_COMBO_MATERIALS && (
              <p className='text-xs font-light text-amber-500'>
                {t('products.detail.comboSpecification.materialLimitWarning', { count: MAX_COMBO_MATERIALS })}
              </p>
            )}
            <Tabs defaultValue='core' className='min-h-0 flex-1'>
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
                    factor={factor}
                    onRemove={removeDraft}
                    onUpdate={updateDraft}
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
                    factor={factor}
                    onRemove={removeDraft}
                    onUpdate={updateDraft}
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
            onClick={() => void handleSave()}
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
  title,
  isCore,
  drafts,
  factor,
  onRemove,
  onUpdate,
  t
}: {
  title: string
  isCore: boolean
  drafts: MaterialDraft[]
  factor: number
  onRemove: (matId: string) => void
  onUpdate: (matId: string, updates: Partial<MaterialDraft>) => void
  t: TenantT
}) {
  return (
    <div className='rounded-lg p-3'>
      <h4
        className={`mb-3 rounded-md border px-2 py-1 text-xs font-semibold ${
          isCore
            ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-400'
            : 'border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-900/60 dark:bg-sky-950/40 dark:text-sky-400'
        }`}
      >
        {title}
      </h4>
      <div className='space-y-3'>
        {drafts.length === 0 ? (
          <p className='text-xs text-muted-foreground'>{t('products.detail.comboSpecification.noSelectedMaterials')}</p>
        ) : (
          drafts.map((draft) => (
            <SelectedMaterialCard
              key={draft.matId}
              draft={draft}
              factor={factor}
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

function MaterialImage({ src, alt, emptyLabel }: { src?: string | null; alt: string; emptyLabel: string }) {
  return (
    <div className='flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-md border bg-muted/30'>
      {src ? (
        <img src={src} alt={alt} className='size-full object-cover' />
      ) : (
        <span className='text-xs text-muted-foreground'>{emptyLabel}</span>
      )}
    </div>
  )
}
