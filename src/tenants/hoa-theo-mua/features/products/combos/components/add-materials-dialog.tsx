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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import type { TenantT } from '@/lib/i18n/use-tenant-translation'
import { PlusIcon, SearchIcon } from 'lucide-react'
import { useMemo, useState } from 'react'
import type { MaterialOption, ComboMaterial, UpdateComboSpecificationMaterial } from '../types'
import { useAddComboSpecificationItems } from '../hooks/use-add-combo-specification-items'
import { useGetMaterials } from '../hooks/use-get-materials'

const CORE_ROLE = '1'
const getActualQuantity = (quantity: number, factor: number) => Math.floor(quantity * factor)

interface MaterialDraft extends UpdateComboSpecificationMaterial {
  materialName: string
  unit: string | null
}

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
  const { materials, isGettingMaterials } = useGetMaterials({ search, enabled: open })
  const { addComboSpecificationItems, isAddingComboSpecificationItems } = useAddComboSpecificationItems()
  const existingIds = useMemo(
    () => new Set(existingMaterials.map((material) => material.materialId)),
    [existingMaterials]
  )
  const selectableMaterials = materials.filter((material) => !existingIds.has(material.materialId))

  const toggleMaterial = (material: MaterialOption, checked: boolean) => {
    setDrafts((current) =>
      checked
        ? current.some((draft) => draft.matId === material.materialId)
          ? current
          : [
              ...current,
              {
                matId: material.materialId,
                materialName: material.materialName,
                unit: material.unit,
                quantity: 1,
                isCore: true,
                isActive: true
              }
            ]
        : current.filter((draft) => draft.matId !== material.materialId)
    )
  }

  const updateDraft = (matId: string, updates: Partial<MaterialDraft>) => {
    setDrafts((current) => current.map((draft) => (draft.matId === matId ? { ...draft, ...updates } : draft)))
  }

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen && !isAddingComboSpecificationItems) {
      setDrafts([])
      setSearch('')
    }
    onOpenChange(nextOpen)
  }

  const handleSave = async () => {
    if (drafts.length === 0 || drafts.some((draft) => draft.quantity <= 0)) return
    await addComboSpecificationItems({
      comboId,
      body: { items: drafts.map(({ matId, quantity, isCore, isActive }) => ({ matId, quantity, isCore, isActive })) }
    })
    handleOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className='min-w-4xl' position='top-center'>
        <DialogHeader>
          <DialogTitle>{t('products.detail.comboSpecification.addTitle')}</DialogTitle>
          <DialogDescription>{t('products.detail.comboSpecification.addDescription')}</DialogDescription>
        </DialogHeader>
        <div className='space-y-4'>
          <div className='relative'>
            <SearchIcon className='absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground' />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={t('products.detail.comboSpecification.searchMaterial')}
              className='pl-9'
            />
          </div>
          <div className='max-h-80 overflow-y-auto rounded-lg border'>
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
              selectableMaterials.map((material) => {
                const draft = drafts.find((item) => item.matId === material.materialId)
                return (
                  <div key={material.materialId} className='flex items-center gap-3 border-b p-3 last:border-b-0'>
                    <Checkbox
                      checked={!!draft}
                      onCheckedChange={(checked) => toggleMaterial(material, checked === true)}
                      aria-label={material.materialName}
                    />
                    <div className='flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-md border bg-muted/30'>
                      {material.coverImage ? (
                        <img src={material.coverImage} alt={material.materialName} className='size-full object-cover' />
                      ) : (
                        <span className='text-xs text-muted-foreground'>-</span>
                      )}
                    </div>
                    <div className='min-w-0 flex-1'>
                      <p className='truncate text-sm font-medium'>{material.materialName}</p>
                      <p className='text-xs text-muted-foreground'>
                        {material.materialCode} · {material.unit || '-'} ·{' '}
                        {t('products.detail.comboSpecification.stock')}: {material.availableStock ?? '-'}
                      </p>
                    </div>
                    {draft && (
                      <div className='flex items-center gap-2'>
                        <Input
                          type='number'
                          min={0.01}
                          step='any'
                          value={draft.quantity}
                          onChange={(event) =>
                            updateDraft(material.materialId, { quantity: Number(event.target.value) })
                          }
                          className='w-24'
                          aria-label={t('products.detail.comboSpecification.quantityPerCombo')}
                        />
                        <span className='whitespace-nowrap text-sm text-muted-foreground'>
                          × {factor} ={' '}
                          <strong className='text-foreground'>{getActualQuantity(draft.quantity, factor)}</strong>
                        </span>
                        <Select
                          value={draft.isCore ? CORE_ROLE : '2'}
                          onValueChange={(value) => updateDraft(material.materialId, { isCore: value === CORE_ROLE })}
                        >
                          <SelectTrigger className='w-40 min-w-40'>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value={CORE_ROLE}>{t('products.detail.comboSpecification.core')}</SelectItem>
                            <SelectItem value='2'>{t('products.detail.comboSpecification.support')}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>
                )
              })
            )}
          </div>
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
            {isAddingComboSpecificationItems ? t('common.ui.loading') : t('products.detail.comboSpecification.save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
