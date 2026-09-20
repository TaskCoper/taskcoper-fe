import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { FieldError } from '@/components/ui/field'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import type { TenantT } from '@/lib/i18n/use-tenant-translation'
import { useConfirmStore } from '@/lib/zustand/confirm.store'
import { CheckIcon, CircleCheck, CircleX, PackageCheck, PencilIcon, PlusIcon, Trash2Icon, XIcon } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Controller, useFieldArray, useForm, useWatch } from 'react-hook-form'
import type { ComboMaterial } from '../types'
import {
  createComboFactorSchema,
  createComboMaterialsSchema,
  type ComboFactorFormValues,
  type ComboMaterialsFormValues
} from '../validations'
import { useDeleteComboSpecificationItems } from '../hooks/use-delete-combo-specification-items'
import { useUpdateChildQuantity } from '../hooks/use-update-child-quantity'
import { useUpdateComboSpecificationItems } from '../hooks/use-update-combo-specification-items'
import { DetailSection } from '../../components/product-detail/parts'
import { useGetProductsByIds } from '../../hooks/use-get-products-by-ids'
import { AddMaterialsDialog } from './add-materials-dialog'
import ComboMaterialTable, { type MaterialEditValue } from './combo-material-table'

export function ComboSpecification({
  productId,
  comboId,
  factor: initialFactor,
  sellableQuantity,
  stockStatus,
  canEditFactor,
  canManageMaterials,
  isUpdatingPublication,
  onEnsureUnpublished,
  materials,
  isLoading,
  isError,
  t
}: {
  productId: string
  comboId: string
  factor: number | null
  sellableQuantity?: number | null
  stockStatus?: string | null
  canEditFactor: boolean
  canManageMaterials: boolean
  isUpdatingPublication: boolean
  onEnsureUnpublished: () => Promise<boolean>
  materials: ComboMaterial[]
  isLoading: boolean
  isError: boolean
  t: TenantT
}) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const normalizedInitialFactor = initialFactor !== null && initialFactor > 0 ? initialFactor : null
  const [isEditing, setIsEditing] = useState(false)
  const [selectedMaterialIds, setSelectedMaterialIds] = useState<Set<string>>(new Set())
  const { confirm } = useConfirmStore()
  const { deleteComboSpecificationItems, isDeletingComboSpecificationItems } = useDeleteComboSpecificationItems()
  const { updateChildQuantity, isUpdatingChildQuantity } = useUpdateChildQuantity()
  const { updateComboSpecificationItems, isUpdatingComboSpecificationItems } = useUpdateComboSpecificationItems()
  const materialProductIds = useMemo(
    () => (canEditFactor ? materials.map((material) => material.materialId) : []),
    [canEditFactor, materials]
  )
  const { productsById: materialProductsById, isGettingProductsByIds: isGettingMaterialProducts } =
    useGetProductsByIds(materialProductIds)
  const materialProductLabels = useMemo(
    () =>
      Object.fromEntries(
        materialProductIds.map((materialId) => [materialId, materialProductsById[materialId]?.productLabel])
      ),
    [materialProductIds, materialProductsById]
  )
  const factorSchema = useMemo(() => createComboFactorSchema(t), [t])
  const materialsSchema = useMemo(() => createComboMaterialsSchema(t), [t])
  const factorForm = useForm<ComboFactorFormValues>({
    resolver: zodResolver(factorSchema),
    defaultValues: { factor: normalizedInitialFactor },
    mode: 'onChange'
  })
  const materialsForm = useForm<ComboMaterialsFormValues>({
    resolver: zodResolver(materialsSchema),
    defaultValues: { items: [] },
    mode: 'onChange'
  })
  const { fields: materialFields, replace: replaceMaterials } = useFieldArray({
    control: materialsForm.control,
    name: 'items'
  })
  const factor = useWatch({ control: factorForm.control, name: 'factor' })
  const editItems = useWatch({ control: materialsForm.control, name: 'items' })
  const editValues = useMemo<Record<string, MaterialEditValue>>(
    () => Object.fromEntries(editItems.map((item) => [item.matId, { quantity: item.quantity, isCore: item.isCore }])),
    [editItems]
  )
  const quantityErrors = Object.fromEntries(
    materialFields.map((field, index) => [
      field.matId,
      materialsForm.formState.errors.items?.[index]?.quantity?.message
    ])
  )

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
    return (
      <div className='rounded-lg border py-8 text-center text-sm text-destructive'>
        {t('products.detail.comboSpecification.loadError')}
      </div>
    )
  }

  const coreMaterials = materials.filter((material) => material.isCore)
  const supportMaterials = materials.filter((material) => !material.isCore)

  const handleStartEditing = async () => {
    if (!(await onEnsureUnpublished())) return

    replaceMaterials(
      materials.map((material) => ({
        matId: material.materialId,
        quantity: material.quantityPerCombo,
        isCore: material.isCore,
        isActive: true
      }))
    )
    materialsForm.clearErrors()
    setIsEditing(true)
  }

  const handleOpenAddDialog = async () => {
    if (!(await onEnsureUnpublished())) return

    setIsAddDialogOpen(true)
  }

  const handleEditChange = (materialId: string, updates: Partial<MaterialEditValue>) => {
    const index = materialFields.findIndex((field) => field.matId === materialId)
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

  const handleCancelEditing = () => {
    setIsEditing(false)
    replaceMaterials([])
    materialsForm.clearErrors()
  }

  const handleSaveEditing = async ({ items }: ComboMaterialsFormValues) => {
    await updateComboSpecificationItems({
      comboId,
      body: { items }
    })
    handleCancelEditing()
  }

  const handleSaveFactor = async ({ factor }: ComboFactorFormValues) => {
    await updateChildQuantity({ productId, factor })
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
          <form onSubmit={factorForm.handleSubmit(handleSaveFactor)} className='space-y-1'>
            <div className='flex flex-wrap items-center gap-3'>
              <label htmlFor='combo-factor' className='text-sm font-medium'>
                {t('products.detail.comboSpecification.factor')}
              </label>
              <Controller
                control={factorForm.control}
                name='factor'
                render={({ field, fieldState }) => (
                  <Input
                    id='combo-factor'
                    type='number'
                    min={0}
                    step='any'
                    name={field.name}
                    ref={field.ref}
                    value={Number.isNaN(field.value) ? '' : (field.value ?? '')}
                    aria-invalid={fieldState.invalid}
                    onFocus={(event) => event.currentTarget.select()}
                    onBlur={field.onBlur}
                    onChange={(event) => {
                      field.onChange(event.target.value === '' ? null : event.target.valueAsNumber)
                    }}
                    className='w-40'
                  />
                )}
              />
              <Button type='submit' size='sm' disabled={isUpdatingChildQuantity}>
                {t('products.detail.comboSpecification.saveFactor')}
              </Button>
            </div>
            {factor === null && (
              <p className='text-xs text-muted-foreground'>
                {t('products.detail.comboSpecification.factorUnconfigured')}
              </p>
            )}
            <FieldError errors={[factorForm.formState.errors.factor]} className='text-xs' />
          </form>
        )}

        {!canEditFactor && (
          <ComboAvailability
            quantity={sellableQuantity}
            status={stockStatus}
            label={t('products.detail.comboSpecification.remainingComboQuantity')}
          />
        )}

        <div className='ml-auto flex flex-wrap justify-end gap-2'>
          {canEditFactor && (
            <ComboAvailability
              quantity={sellableQuantity}
              status={stockStatus}
              label={t('products.detail.comboSpecification.availableQuantity')}
            />
          )}
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
                onClick={() => void materialsForm.handleSubmit(handleSaveEditing)()}
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
                    onClick={() => void handleStartEditing()}
                    disabled={materials.length === 0 || isUpdatingPublication}
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
                  <Button type='button' onClick={() => void handleOpenAddDialog()} disabled={isUpdatingPublication}>
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
          {t('products.detail.comboSpecification.noRecipe')}
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
            applyFactor={canEditFactor}
            isEditing={isEditing}
            editValues={editValues}
            quantityErrors={quantityErrors}
            productLabelsByMaterialId={materialProductLabels}
            isGettingProductLabels={isGettingMaterialProducts}
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
            applyFactor={canEditFactor}
            isEditing={isEditing}
            editValues={editValues}
            quantityErrors={quantityErrors}
            productLabelsByMaterialId={materialProductLabels}
            isGettingProductLabels={isGettingMaterialProducts}
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
          existingMaterials={materials}
          t={t}
        />
      )}
    </div>
  )
}

function ComboAvailability({
  quantity,
  status,
  label
}: {
  quantity?: number | null
  status?: string | null
  label: string
}) {
  // if (quantity == null && !status) return null
  const isInStock = status === 'Còn hàng'
  return (
    <div className='inline-flex items-center gap-2 rounded-md border bg-muted/40 px-3 py-1.5 text-sm'>
      <PackageCheck className='size-4.5 text-muted-foreground' />

      <span className='font-medium'>{label}:</span>

      <span className='font-semibold tabular-nums'>{quantity ?? '--'}</span>

      {status && (
        <span className='ml-1 inline-flex items-center gap-1'>
          {isInStock ? (
            <CircleCheck className='size-4 text-emerald-600' />
          ) : (
            <CircleX className='size-4 text-destructive' />
          )}

          <span className={isInStock ? 'text-emerald-600' : 'text-destructive'}>{status}</span>
        </span>
      )}
    </div>
  )
}
