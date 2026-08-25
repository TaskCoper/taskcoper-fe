import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { TenantT } from '@/lib/i18n/use-tenant-translation'
import { XIcon } from 'lucide-react'
import { ComboRole, ComboRoleLabel, type UpdateComboSpecificationMaterial } from '../types'

export interface MaterialDraft extends UpdateComboSpecificationMaterial {
  materialCode: string
  materialName: string
  coverImage?: string | null
  unit: string | null
}

export function SelectedMaterialCard({
  draft,
  onRemove,
  onUpdate,
  t
}: {
  draft: MaterialDraft
  onRemove: (matId: string) => void
  onUpdate: (matId: string, updates: Partial<MaterialDraft>) => void
  t: TenantT
}) {
  return (
    <div className='space-y-3 rounded-lg border p-3'>
      <div className='flex items-start gap-3'>
        <MaterialImage src={draft.coverImage} alt={draft.materialName} />
        <div className='min-w-0 flex-1'>
          <p className='truncate text-sm font-medium'>{draft.materialName}</p>
          <p className='truncate text-xs text-muted-foreground'>
            {draft.materialCode} · {draft.unit || t('products.common.noData')}
          </p>
        </div>
        <Button
          type='button'
          variant='ghost'
          size='icon'
          onClick={() => onRemove(draft.matId)}
          aria-label={t('products.detail.comboSpecification.removeMaterial')}
        >
          <XIcon />
        </Button>
      </div>
      <div className='grid gap-2 sm:grid-cols-2'>
        <div className='space-y-1'>
          <label className='text-xs text-muted-foreground'>
            {t('products.detail.comboSpecification.quantityPerCombo')}
          </label>
          <Input
            type='number'
            min={0}
            step='any'
            value={draft.quantity}
            onChange={(event) => onUpdate(draft.matId, { quantity: Number(event.target.value) })}
          />
          <p className='text-xs text-muted-foreground'>
            {t('products.detail.comboSpecification.actualQuantity')}:{' '}
            {draft.quantity > 0 ? draft.quantity : t('products.detail.comboSpecification.unconfigured')}
          </p>
        </div>
        <div className='space-y-1'>
          <label className='text-xs text-muted-foreground'>{t('products.detail.comboSpecification.role')}</label>
          <Select
            value={draft.isCore ? ComboRole[1] : ComboRole[2]}
            onValueChange={(value) => onUpdate(draft.matId, { isCore: value === ComboRole[1] })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ComboRole[1]}>{t(ComboRoleLabel[ComboRole[1]])}</SelectItem>
              <SelectItem value={ComboRole[2]}>{t(ComboRoleLabel[ComboRole[2]])}</SelectItem>
            </SelectContent>
          </Select>
        </div>
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
