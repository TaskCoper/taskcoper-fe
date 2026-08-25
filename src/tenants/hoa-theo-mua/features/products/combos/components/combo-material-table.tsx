import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { FieldError } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import type { TenantT } from '@/lib/i18n/use-tenant-translation'
import { cn } from '@/shared/utils'
import { ComboRole, ComboRoleLabel, type ComboMaterial } from '../types'

// const CORE_ROLE = '1'

const getActualQuantity = (quantity: number, factor: number) => Math.floor(quantity * factor)

const getActualQuantityDisplay = (quantity: number, factor: number | null, applyFactor: boolean) => {
  if (!Number.isFinite(quantity) || quantity <= 0) return null
  if (!applyFactor) return quantity
  if (factor === null || !Number.isFinite(factor) || factor <= 0) return null

  return getActualQuantity(quantity, factor)
}

export interface MaterialEditValue {
  quantity: number
  isCore: boolean
}

export default function ComboMaterialTable({
  materials,
  factor,
  applyFactor,
  isEditing,
  editValues,
  quantityErrors,
  onEditChange,
  selectedMaterialIds,
  onToggle,
  onToggleAll,
  t
}: {
  materials: ComboMaterial[]
  factor: number | null
  applyFactor: boolean
  isEditing: boolean
  editValues: Record<string, MaterialEditValue>
  quantityErrors: Record<string, string | undefined>
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
            <TableRow className='bg-muted'>
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
              <TableHead className='text-center'>{t('products.detail.comboSpecification.availableForSale')}</TableHead>
              <TableHead className='text-center'>{t('products.detail.comboSpecification.maxComboPossible')}</TableHead>
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
                  <div className='flex min-w-0 items-center gap-3'>
                    <div className='flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-md border bg-muted/30'>
                      <img
                        src={material.coverImage || '/images/placeholder-cover.png'}
                        alt={material.materialName || material.materialId}
                        className='size-full object-cover'
                      />
                    </div>
                    <div className='flex min-w-0 flex-col'>
                      <span className='truncate'>
                        {material.materialName?.trim() || t('products.detail.comboSpecification.unnamedMaterial')}
                      </span>
                      <span className='font-mono text-xs font-normal text-muted-foreground'>{material.materialId}</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell className='text-right tabular-nums'>
                  {isEditing ? (
                    <div className='ml-auto w-32'>
                      <Input
                        type='number'
                        min={0}
                        step='any'
                        value={
                          Number.isFinite(editValues[material.materialId]?.quantity)
                            ? editValues[material.materialId]?.quantity || ''
                            : ''
                        }
                        aria-invalid={Boolean(quantityErrors[material.materialId])}
                        onChange={(event) =>
                          onEditChange(material.materialId, {
                            quantity: event.target.value === '' ? Number.NaN : event.target.valueAsNumber
                          })
                        }
                        className='h-9 w-full'
                      />
                      <FieldError
                        className='mt-1 text-left text-xs leading-tight'
                        errors={[{ message: quantityErrors[material.materialId] }]}
                      />
                    </div>
                  ) : material.quantityPerCombo > 0 ? (
                    material.quantityPerCombo
                  ) : (
                    t('products.detail.comboSpecification.unconfigured')
                  )}
                </TableCell>
                <TableCell className='text-right font-semibold tabular-nums text-primary'>
                  {getActualQuantityDisplay(
                    editValues[material.materialId]?.quantity ?? material.quantityPerCombo,
                    factor,
                    applyFactor
                  ) ?? t('products.detail.comboSpecification.unconfigured')}
                </TableCell>
                <TableCell>
                  {material.unit ? (
                    <Badge variant='outline' className='font-normal'>
                      {material.unit}
                    </Badge>
                  ) : (
                    t('products.common.noData')
                  )}
                </TableCell>
                <TableCell>
                  {isEditing ? (
                    <Select
                      value={editValues[material.materialId]?.isCore ? ComboRole[1] : ComboRole[2]}
                      onValueChange={(value) =>
                        onEditChange(material.materialId, {
                          isCore: value === ComboRole[1]
                        })
                      }
                    >
                      <SelectTrigger className='w-40 min-w-40'>
                        <SelectValue />
                      </SelectTrigger>

                      <SelectContent>
                        <SelectItem value={ComboRole[1]}>{t(ComboRoleLabel[ComboRole[1]])}</SelectItem>

                        <SelectItem value={ComboRole[2]}>{t(ComboRoleLabel[ComboRole[2]])}</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <Badge
                      variant='secondary'
                      className={cn(
                        'font-medium',
                        material.isCore
                          ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-400'
                          : 'border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-900/60 dark:bg-sky-950/40 dark:text-sky-400'
                      )}
                    >
                      {material.isCore
                        ? t('products.detail.comboSpecification.core')
                        : t('products.detail.comboSpecification.support')}
                    </Badge>
                  )}
                </TableCell>
                <TableCell className='text-center font-medium tabular-nums'>
                  {material.availableForSale ?? t('products.common.noData')}
                </TableCell>
                <TableCell className='text-center font-semibold tabular-nums text-foreground'>
                  {material.maxComboPossible ?? t('products.common.noData')}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
