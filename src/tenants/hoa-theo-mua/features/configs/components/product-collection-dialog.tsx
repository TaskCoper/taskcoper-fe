import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import type { Config } from '../types'
import ProductCollectionEditor from './product-collection-editor'

interface Props {
  open: boolean
  onClose: () => void
  existingConfig: Config | null
  takenSuffixes?: Set<string>
}

export default function ProductCollectionDialog({ open, onClose, existingConfig, takenSuffixes }: Props) {
  const { t } = useTenantTranslation()

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent
        position='top-center'
        className='flex min-w-5xl flex-col gap-0 p-0 overflow-hidden'
        showCloseButton={false}
      >
        <DialogHeader className='px-6 pt-6 pb-3'>
          <DialogTitle>{t('configsPage.productCollectionDialog.title')}</DialogTitle>
          <p className='text-xs text-muted-foreground'>{t('configsPage.productCollectionDialog.subtitle')}</p>
        </DialogHeader>

        <div className='min-h-0 flex-1 overflow-y-auto px-6 pb-6'>
          <ProductCollectionEditor
            existingConfig={existingConfig}
            onSaved={onClose}
            onCancel={onClose}
            takenSuffixes={takenSuffixes}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
