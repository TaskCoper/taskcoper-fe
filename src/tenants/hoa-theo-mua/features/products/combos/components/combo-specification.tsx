import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import type { TenantT } from '@/lib/i18n/use-tenant-translation'
import { useConfirmStore } from '@/lib/zustand/confirm.store'
import { CheckIcon, PencilIcon, PlusIcon, Trash2Icon, XIcon } from 'lucide-react'
import { useState } from 'react'
import type { ComboMaterial } from '../types'
import { useDeleteComboSpecificationItems } from '../hooks/use-delete-combo-specification-items'
import { useUpdateChildQuantity } from '../hooks/use-update-child-quantity'
import { useUpdateComboSpecificationItems } from '../hooks/use-update-combo-specification-items'
import { DetailSection } from '../../components/product-detail/parts'
import { AddMaterialsDialog } from './add-materials-dialog'
import { ComboMaterialTable, type MaterialEditValue } from './combo-material-table'

const CORE_ROLE = '1'

export function ComboSpecification({
  productId,
  comboId,
  factor: initialFactor,
  comboAvailableQty,
  comboStockStatus,
  canEditFactor,
  canManageMaterials,
  materials,
  isLoading,
  isError,
  t
}: {
  productId: string
  comboId: string
  factor: number
  comboAvailableQty?: number | null
  comboStockStatus?: string | null
  canEditFactor: boolean
  canManageMaterials: boolean
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
  const { updateChildQuantity, isUpdatingChildQuantity } = useUpdateChildQuantity()
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
      matId: material.materialId,
      quantity: editValues[material.materialId]?.quantity ?? material.quantityPerCombo,
      isCore: editValues[material.materialId]?.isCore ?? String(material.role) === CORE_ROLE,
      isActive: true
    }))

    if (items.some((item) => !Number.isInteger(item.quantity) || item.quantity <= 0)) return

    await updateComboSpecificationItems({
      comboId,
      body: { items }
    })
    handleCancelEditing()
  }

  const handleSaveFactor = async () => {
    if (!isFactorValid || isUpdatingChildQuantity) return

    await updateChildQuantity({ productId, factor })
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
        materials: selectedMaterials.map((material) => material.materialId)
      }
    })
    setSelectedMaterialIds(new Set())
  }

  return (
    <div className='space-y-8'>
      <div className='flex flex-wrap items-end justify-between gap-4'>
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
                      disabled={!isFactorValid || isUpdatingChildQuantity}
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

        {!canEditFactor && <ComboAvailability quantity={comboAvailableQty} status={comboStockStatus} t={t} />}

        <div className='ml-auto flex flex-wrap justify-end gap-2'>
          {canEditFactor && <ComboAvailability quantity={comboAvailableQty} status={comboStockStatus} t={t} />}
          {isEditing && canManageMaterials ? (
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
              {canManageMaterials && (
                <>
                  <Button
                    type='button'
                    variant='outline'
                    onClick={handleStartEditing}
                    disabled={materials.length === 0}
                  >
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

      {canManageMaterials && (
        <AddMaterialsDialog
          open={isAddDialogOpen}
          onOpenChange={setIsAddDialogOpen}
          comboId={comboId}
          factor={factor}
          existingMaterials={materials}
          t={t}
        />
      )}
    </div>
  )
}

function ComboAvailability({ quantity, status, t }: { quantity?: number | null; status?: string | null; t: TenantT }) {
  if (quantity == null && !status) return null

  return (
    <div className='rounded-md border bg-muted/40 px-3 py-1.5 text-sm'>
      <span className='font-medium'>{t('products.detail.comboSpecification.availableQuantity')}:</span>{' '}
      <span className='tabular-nums'>{quantity ?? '-'}</span>
      {status && <span className='ml-2 text-muted-foreground'>({status})</span>}
    </div>
  )
}
