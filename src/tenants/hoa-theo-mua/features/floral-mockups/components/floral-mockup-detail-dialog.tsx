import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { cn } from '@/shared/utils'
import { ImageOffIcon, ZoomInIcon } from 'lucide-react'
import { useState } from 'react'
import type { FloralMockupListItem } from '../types'

export default function FloralMockupDetailDialog({
  mockup,
  open,
  onOpenChange,
  onPreview
}: {
  mockup: FloralMockupListItem | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onPreview: (mockup: FloralMockupListItem) => void
}) {
  const { t } = useTenantTranslation()
  const [failedSrc, setFailedSrc] = useState<string | null>(null)
  const hasImageError = Boolean(mockup?.imageUrl && failedSrc === mockup.imageUrl)

  if (!mockup) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-2xl'>
        <DialogHeader>
          <DialogTitle>{mockup.name}</DialogTitle>
          <DialogDescription>{t('floralMockups.detail.description')}</DialogDescription>
        </DialogHeader>

        {mockup.imageUrl && !hasImageError ? (
          <button
            type='button'
            className='group relative mx-auto max-h-96 w-fit overflow-hidden rounded-xl border bg-muted/30 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
            aria-label={t('floralMockups.openPreview', { name: mockup.name })}
            onClick={() => onPreview(mockup)}
          >
            <img
              src={mockup.imageUrl}
              alt={t('floralMockups.previewAlt', { name: mockup.name })}
              className='max-h-96 w-auto object-contain'
              onError={() => setFailedSrc(mockup.imageUrl)}
            />
            <span className='absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/30'>
              <span className='flex size-11 scale-90 items-center justify-center rounded-full bg-background/95 opacity-0 shadow-lg transition-all group-hover:scale-100 group-hover:opacity-100'>
                <ZoomInIcon className='size-5' aria-hidden='true' />
              </span>
            </span>
          </button>
        ) : (
          <div className='flex h-52 items-center justify-center rounded-xl border bg-muted/30 text-muted-foreground'>
            <ImageOffIcon className='size-10' aria-hidden='true' />
          </div>
        )}

        <div className='grid gap-4 rounded-xl border p-4 sm:grid-cols-[1fr_auto]'>
          <div className='space-y-1'>
            <p className='text-xs font-medium text-muted-foreground'>{t('floralMockups.column.description')}</p>
            <p className='text-sm leading-relaxed'>{mockup.description?.trim() || t('floralMockups.noDescription')}</p>
          </div>
          <div className='space-y-1 sm:text-right'>
            <p className='text-xs font-medium text-muted-foreground'>{t('floralMockups.column.status')}</p>
            <Badge
              variant='outline'
              className={cn(
                mockup.isActive
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                  : 'border-muted-foreground/20 bg-muted text-muted-foreground'
              )}
            >
              {t(`floralMockups.status.${mockup.isActive ? 'active' : 'inactive'}`)}
            </Badge>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
