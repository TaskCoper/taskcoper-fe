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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import type { TenantT } from '@/lib/i18n/use-tenant-translation'
import { useConfirmStore } from '@/lib/zustand/confirm.store'
import { cn } from '@/shared/utils'
import { CheckIcon, PencilIcon, PlusIcon, SearchIcon, Trash2Icon, XIcon } from 'lucide-react'
import { useMemo, useState } from 'react'
import type { ComboMaterial, MaterialOption, UpdateComboSpecificationMaterial } from '../types'
import { useDeleteComboSpecificationItems } from '../hooks/use-delete-combo-specification-items'
import { useAddComboSpecificationItems } from '../hooks/use-add-combo-specification-items'
import { useGetMaterials } from '../hooks/use-get-materials'
import { useUpdateComboSpecification } from '../hooks/use-update-combo-specification'
import { useUpdateComboSpecificationItems } from '../hooks/use-update-combo-specification-items'
import { DetailSection } from '../../components/product-detail/parts'

const CORE_ROLE = '1'

const getActualQuantity = (quantity: number, factor: number) => Math.floor(quantity * factor)

interface MaterialEditValue {
  quantity: number
  isCore: boolean
}

function ComboMaterialTable({
  materials,
  factor,
  isEditing,
  editValues,
  onEditChange,
  selectedMaterialIds,
  onToggle,
  onToggleAll,
  t
}: {
  materials: ComboMaterial[]
  factor: number
  isEditing: boolean
  editValues: Record<string, MaterialEditValue>
  onEditChange: (materialId: string, updates: Partial<MaterialEditValue>) => void
  selectedMaterialIds: Set<string>
  onToggle: (materialId: string) => void
  onToggleAll: (materialIds: string[]) => void
  t: TenantT
}) {
  const materialIds = materials.map((material) => material.materialId)
  const allSelected = materialIds.length > 0 && materialIds.every((materialId) => selectedMaterialIds.has(materialId))

  return (
    <div className='overflow-hidden rounded-xl border bg-background shadow-sm'>
      <div className='overflow-x-auto'>
        <Table className='min-w-245'>
          <TableHeader className='bg-muted/40'>
            <TableRow>
              <TableHead className='w-12'>
                <Checkbox
                  checked={allSelected}
                  onCheckedChange={() => onToggleAll(materialIds)}
                  aria-label={t('products.detail.comboSpecification.selectAll')}
                />
              </TableHead>
              <TableHead>{t('products.detail.comboSpecification.material')}</TableHead>
              <TableHead className='text-right'>{t('products.detail.comboSpecification.baseQuantity')}</TableHead>
              <TableHead className='text-right'>{t('products.detail.comboSpecification.actualQuantity')}</TableHead>
              <TableHead>{t('products.detail.comboSpecification.unit')}</TableHead>
              <TableHead>{t('products.detail.comboSpecification.role')}</TableHead>
              <TableHead className='text-right'>{t('products.detail.comboSpecification.availableForSale')}</TableHead>
              <TableHead className='text-right'>{t('products.detail.comboSpecification.maxComboPossible')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {materials.map((material, index) => (
              <TableRow key={`${material.materialId}-${index}`}>
                <TableCell>
                  <Checkbox
                    checked={selectedMaterialIds.has(material.materialId)}
                    onCheckedChange={() => onToggle(material.materialId)}
                    aria-label={t('products.detail.comboSpecification.selectMaterial', {
                      name: material.materialName || material.materialId
                    })}
                  />
                </TableCell>
                <TableCell className='min-w-52 font-medium'>
                  <div className='flex min-w-0 flex-col'>
                    <span className='truncate'>
                      {material.materialName?.trim() || t('products.detail.comboSpecification.unnamedMaterial')}
                    </span>
                    <span className='font-mono text-xs font-normal text-muted-foreground'>{material.materialId}</span>
                  </div>
                </TableCell>
                <TableCell className='text-right tabular-nums'>
                  {isEditing ? (
                    <Input
                      type='number'
                      min={1}
                      step={1}
                      value={editValues[material.materialId]?.quantity ?? material.quantityPerCombo}
                      onChange={(event) => onEditChange(material.materialId, { quantity: Number(event.target.value) })}
                      className='ml-auto h-9 w-24'
                    />
                  ) : (
                    material.quantityPerCombo
                  )}
                </TableCell>
                <TableCell className='text-right font-semibold tabular-nums text-primary'>
                  {getActualQuantity(editValues[material.materialId]?.quantity ?? material.quantityPerCombo, factor)}
                </TableCell>
                <TableCell>
                  {material.unit ? (
                    <Badge variant='outline' className='font-normal'>
                      {material.unit}
                    </Badge>
                  ) : (
                    '-'
                  )}
                </TableCell>
                <TableCell>
                  {isEditing ? (
                    <Select
                      value={editValues[material.materialId]?.isCore ? CORE_ROLE : '2'}
                      onValueChange={(value) => onEditChange(material.materialId, { isCore: value === CORE_ROLE })}
                    >
                      <SelectTrigger className='w-40 min-w-40'>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={CORE_ROLE}>{t('products.detail.comboSpecification.core')}</SelectItem>
                        <SelectItem value='2'>{t('products.detail.comboSpecification.support')}</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <Badge
                      variant='secondary'
                      className={cn(
                        'font-medium',
                        String(material.role) === CORE_ROLE
                          ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-400'
                          : 'border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-900/60 dark:bg-sky-950/40 dark:text-sky-400'
                      )}
                    >
                      {String(material.role) === CORE_ROLE
                        ? t('products.detail.comboSpecification.core')
                        : t('products.detail.comboSpecification.support')}
                    </Badge>
                  )}
                </TableCell>
                <TableCell className='text-right font-medium tabular-nums'>
                  {material.availableForSale ?? '-'}
                </TableCell>
                <TableCell className='text-right font-semibold tabular-nums text-foreground'>
                  {material.maxComboPossible ?? '-'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

interface MaterialDraft extends UpdateComboSpecificationMaterial {
  materialName: string
  unit: string | null
}

function AddMaterialsDialog({
  open,
  onOpenChange,
  comboId,
  subId,
  factor,
  existingMaterials,
  t
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  comboId: string
  subId: string
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
    setDrafts((current) => {
      if (checked) {
        if (current.some((draft) => draft.matId === material.materialId)) return current
        return [
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
      }

      return current.filter((draft) => draft.matId !== material.materialId)
    })
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
      body: {
        items: drafts.map((draft) => ({
          subId,
          matId: draft.matId,
          quantity: draft.quantity,
          isCore: draft.isCore
        }))
      }
    })
    handleOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className='max-w-3xl' position='top-center'>
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
            {isAddingComboSpecificationItems ? t('common.ui.loading') : t('products.detail.comboSpecification.save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function ComboSpecification({
  productId,
  comboId,
  subId,
  factor: initialFactor,
  canEditFactor,
  materials,
  isLoading,
  isError,
  t
}: {
  productId: string
  comboId: string
  subId: string
  factor: number
  canEditFactor: boolean
  materials: ComboMaterial[]
  isLoading: boolean
  isError: boolean
  t: TenantT
}) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [factor, setFactor] = useState(initialFactor >= 1 ? initialFactor : 1)
  const [savedFactor, setSavedFactor] = useState(initialFactor >= 1 ? initialFactor : 1)
  const [isEditing, setIsEditing] = useState(false)
  const [editValues, setEditValues] = useState<Record<string, MaterialEditValue>>({})
  const [selectedMaterialIds, setSelectedMaterialIds] = useState<Set<string>>(new Set())
  const { confirm } = useConfirmStore()
  const { deleteComboSpecificationItems, isDeletingComboSpecificationItems } = useDeleteComboSpecificationItems()
  const { updateComboSpecification: saveFactor, isUpdatingComboSpecification: isSavingFactor } =
    useUpdateComboSpecification()
  const { updateComboSpecificationItems, isUpdatingComboSpecificationItems } = useUpdateComboSpecificationItems()

  if (isLoading) {
    return (
      <div className='space-y-8'>
        {[1, 2].map((section) => (
          <div key={section} className='space-y-3'>
            <Skeleton className='h-6 w-40' />
            <Skeleton className='h-40 w-full rounded-lg' />
          </div>
        ))}
      </div>
    )
  }

  if (isError) {
    return <div className='rounded-lg border py-8 text-center text-sm text-destructive'>{t('common.error')}</div>
  }

  const coreMaterials = materials.filter((material) => String(material.role) === CORE_ROLE)
  const supportMaterials = materials.filter((material) => String(material.role) !== CORE_ROLE)
  const isFactorValid = factor >= 1

  const handleStartEditing = () => {
    setEditValues(
      Object.fromEntries(
        materials.map((material) => [
          material.materialId,
          {
            quantity: material.quantityPerCombo,
            isCore: String(material.role) === CORE_ROLE
          }
        ])
      )
    )
    setIsEditing(true)
  }

  const handleEditChange = (materialId: string, updates: Partial<MaterialEditValue>) => {
    setEditValues((current) => ({
      ...current,
      [materialId]: { ...current[materialId], ...updates }
    }))
  }

  const handleCancelEditing = () => {
    setIsEditing(false)
    setEditValues({})
  }

  const handleSaveEditing = async () => {
    const items = materials.map((material) => ({
      subId,
      matId: material.materialId,
      quantity: editValues[material.materialId]?.quantity ?? material.quantityPerCombo,
      isCore: editValues[material.materialId]?.isCore ?? String(material.role) === CORE_ROLE
    }))

    if (items.some((item) => !Number.isInteger(item.quantity) || item.quantity <= 0)) return

    await updateComboSpecificationItems({
      comboId: productId,
      body: { items }
    })
    handleCancelEditing()
  }

  const handleSaveFactor = async () => {
    if (!isFactorValid || isSavingFactor) return

    await saveFactor({
      id: productId,
      body: {
        subId,
        factor,
        materials: materials.map((material) => ({
          matId: material.materialId,
          quantity: material.quantityPerCombo,
          isCore: String(material.role) === CORE_ROLE,
          isActive: true
        }))
      }
    })
    setSavedFactor(factor)
  }

  const toggleMaterial = (materialId: string) => {
    setSelectedMaterialIds((current) => {
      const next = new Set(current)
      if (next.has(materialId)) next.delete(materialId)
      else next.add(materialId)
      return next
    })
  }

  const toggleAllMaterials = (materialIds: string[]) => {
    setSelectedMaterialIds((current) => {
      const next = new Set(current)
      const allSelected = materialIds.every((materialId) => next.has(materialId))
      materialIds.forEach((materialId) => (allSelected ? next.delete(materialId) : next.add(materialId)))
      return next
    })
  }

  const handleDelete = async () => {
    const selectedMaterials = materials.filter((material) => selectedMaterialIds.has(material.materialId))
    if (selectedMaterials.length === 0 || isDeletingComboSpecificationItems) return

    const shouldDelete = await confirm({
      title: t('products.detail.comboSpecification.deleteTitle'),
      description: t('products.detail.comboSpecification.deleteDescription', { count: selectedMaterials.length }),
      confirmText: t('products.detail.comboSpecification.deleteConfirm'),
      variant: 'destructive'
    })
    if (!shouldDelete) return

    await deleteComboSpecificationItems({
      id: comboId,
      body: {
        items: selectedMaterials.map((material) => ({
          subId: material.subId || subId,
          matId: material.materialId
        }))
      }
    })
    setSelectedMaterialIds(new Set())
  }

  return (
    <div className='space-y-8'>
      <div className={`flex flex-wrap items-end gap-4 ${canEditFactor ? 'justify-between' : 'justify-end'}`}>
        {canEditFactor && (
          <div className='space-y-1'>
            <div className='flex flex-wrap items-center gap-3'>
              <label htmlFor='combo-factor' className='text-sm font-medium'>
                {t('products.detail.comboSpecification.factor')}
              </label>
              {canEditFactor ? (
                <>
                  <Input
                    id='combo-factor'
                    type='number'
                    min={1}
                    step={0.1}
                    value={factor}
                    onFocus={(event) => event.currentTarget.select()}
                    onChange={(event) => {
                      const normalizedValue = event.target.value.replace(/^0+(?=\d)/, '')
                      setFactor(Number(normalizedValue))
                    }}
                    className='w-40'
                  />
                  {factor !== savedFactor && (
                    <Button
                      type='button'
                      size='sm'
                      onClick={() => void handleSaveFactor()}
                      disabled={!isFactorValid || isSavingFactor}
                    >
                      {t('products.detail.comboSpecification.saveFactor')}
                    </Button>
                  )}
                </>
              ) : (
                <span className='rounded-md border bg-muted px-3 py-1.5 text-sm tabular-nums'>{factor}</span>
              )}
            </div>
            {canEditFactor && !isFactorValid && (
              <p className='text-xs text-destructive'>{t('products.detail.comboSpecification.factorHint')}</p>
            )}
          </div>
        )}

        <div className='flex flex-wrap justify-end gap-2'>
          {isEditing ? (
            <>
              <Button
                type='button'
                variant='outline'
                onClick={handleCancelEditing}
                disabled={isUpdatingComboSpecificationItems}
              >
                <XIcon data-icon='inline-start' />
                {t('common.button.cancel')}
              </Button>
              <Button
                type='button'
                onClick={() => void handleSaveEditing()}
                disabled={isUpdatingComboSpecificationItems}
              >
                <CheckIcon data-icon='inline-start' />
                {isUpdatingComboSpecificationItems
                  ? t('common.ui.loading')
                  : t('products.detail.comboSpecification.saveChanges')}
              </Button>
            </>
          ) : (
            <>
              <Button type='button' variant='outline' onClick={handleStartEditing} disabled={materials.length === 0}>
                <PencilIcon data-icon='inline-start' />
                {t('products.detail.comboSpecification.editButton')}
              </Button>
              {selectedMaterialIds.size > 0 && (
                <Button
                  type='button'
                  variant='destructive'
                  onClick={() => void handleDelete()}
                  disabled={isDeletingComboSpecificationItems}
                >
                  <Trash2Icon data-icon='inline-start' />
                  {t('products.detail.comboSpecification.deleteButton')} ({selectedMaterialIds.size})
                </Button>
              )}
              <Button type='button' onClick={() => setIsAddDialogOpen(true)}>
                <PlusIcon data-icon='inline-start' />
                {t('products.detail.comboSpecification.addButton')}
              </Button>
            </>
          )}
        </div>
      </div>

      {materials.length === 0 && (
        <div className='rounded-lg border py-8 text-center text-sm text-muted-foreground'>
          {t('products.common.noData')}
        </div>
      )}

      {coreMaterials.length > 0 && (
        <DetailSection
          title={t('products.detail.comboSpecification.core')}
          description={t('products.detail.comboSpecification.coreDescription')}
        >
          <ComboMaterialTable
            materials={coreMaterials}
            factor={factor}
            isEditing={isEditing}
            editValues={editValues}
            onEditChange={handleEditChange}
            selectedMaterialIds={selectedMaterialIds}
            onToggle={toggleMaterial}
            onToggleAll={toggleAllMaterials}
            t={t}
          />
        </DetailSection>
      )}

      {supportMaterials.length > 0 && (
        <DetailSection
          title={t('products.detail.comboSpecification.support')}
          description={t('products.detail.comboSpecification.supportDescription')}
        >
          <ComboMaterialTable
            materials={supportMaterials}
            factor={factor}
            isEditing={isEditing}
            editValues={editValues}
            onEditChange={handleEditChange}
            selectedMaterialIds={selectedMaterialIds}
            onToggle={toggleMaterial}
            onToggleAll={toggleAllMaterials}
            t={t}
          />
        </DetailSection>
      )}

      <AddMaterialsDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        comboId={comboId}
        subId={subId}
        factor={factor}
        existingMaterials={materials}
        t={t}
      />
    </div>
  )
}
