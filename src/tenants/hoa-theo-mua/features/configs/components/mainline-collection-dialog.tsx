import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import type { Config } from '../types'
import MainlineCollectionEditor from './mainline-collection-editor'

interface Props {
  open: boolean
  onClose: () => void
  existingConfig: Config | null
}

export default function MainlineCollectionDialog({ open, onClose, existingConfig }: Props) {
  const { t } = useTenantTranslation()

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent position='top-center' className='flex min-w-5xl flex-col gap-0 p-0' showCloseButton={false}>
        <DialogHeader className='px-6 pt-6 pb-3'>
          <DialogTitle>{t('configsPage.mainlineDialog.title')}</DialogTitle>
          <p className='text-xs text-muted-foreground'>{t('configsPage.mainlineDialog.subtitle')}</p>
        </DialogHeader>

        <div className='flex-1 overflow-y-auto px-6 pb-6'>
          <MainlineCollectionEditor existingConfig={existingConfig} onSaved={onClose} onCancel={onClose} />
        </div>
      </DialogContent>
    </Dialog>
  )
}
