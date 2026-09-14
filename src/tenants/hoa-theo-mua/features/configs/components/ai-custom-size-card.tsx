import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { cn } from '@/shared/utils'
import { ChevronsUpDown, Trash2 } from 'lucide-react'
import type { AiCustomSize } from '../ai-custom-size-config-palette'

interface AiCustomSizeCardProps {
  size: AiCustomSize
  expanded: boolean
  onToggle: () => void
  onChange: (patch: Partial<AiCustomSize>) => void
  onRemove: () => void
}

export default function AiCustomSizeCard({ size, expanded, onToggle, onChange, onRemove }: AiCustomSizeCardProps) {
  const { t } = useTenantTranslation()

  return (
    <div className='min-w-0 rounded-xl border bg-muted/30 p-3'>
      <div className='flex min-w-0 cursor-pointer items-center gap-3' onClick={onToggle}>
        <span className='min-w-0 truncate font-medium'>
          {size.name || t('configsPage.aiCustomSizeDialog.fields.name')}
        </span>
        <span className='text-xs text-muted-foreground'>× {size.comboQuantity}</span>
        <div className='ml-auto flex shrink-0 items-center gap-1' onClick={(event) => event.stopPropagation()}>
          <ChevronsUpDown
            className='mr-1.5 size-3.5 text-muted-foreground'
            aria-label={t('configsPage.aiCustomSizeDialog.toggleDetails')}
          />
          <Switch checked={size.isActive} onCheckedChange={(checked) => onChange({ isActive: checked })} />
          <Button
            type='button'
            variant='ghost'
            size='icon'
            className='text-muted-foreground hover:text-destructive'
            onClick={onRemove}
          >
            <Trash2 />
          </Button>
        </div>
      </div>
      <div
        className={cn(
          'grid transition-[grid-template-rows] duration-200 ease-in-out',
          expanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
        )}
      >
        <div className={cn('min-h-0', expanded ? 'overflow-visible' : 'overflow-hidden')}>
          <div
            className='mt-3 grid min-w-0 gap-3 border-t pt-3 sm:grid-cols-2'
            onClick={(event) => event.stopPropagation()}
          >
            <div className='min-w-0 space-y-1'>
              <Label className='text-xs'>{t('configsPage.aiCustomSizeDialog.fields.name')}</Label>
              <Input
                className='min-w-0'
                value={size.name}
                onChange={(event) => onChange({ name: event.target.value })}
              />
            </div>
            <div className='min-w-0 space-y-1'>
              <Label className='text-xs'>{t('configsPage.aiCustomSizeDialog.fields.comboQuantity')}</Label>
              <Input
                className='min-w-0'
                type='number'
                min={1}
                step={1}
                value={size.comboQuantity}
                onChange={(event) => onChange({ comboQuantity: Number(event.target.value) })}
              />
            </div>
            <div className='min-w-0 space-y-1 sm:col-span-2'>
              <Label className='text-xs'>{t('configsPage.aiCustomSizeDialog.fields.description')}</Label>
              <Textarea
                className='min-w-0'
                rows={2}
                value={size.description ?? ''}
                onChange={(event) => onChange({ description: event.target.value || null })}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
