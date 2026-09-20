import RichTextEditor from '@/components/rich-text-editor'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { useState } from 'react'
import { useUpdateProductDescription } from '../hooks/use-update-product-description'

export default function ProductDescriptionDialog({
  productId,
  description,
  open,
  onOpenChange
}: {
  productId: string
  description: string
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { t } = useTenantTranslation()
  const [value, setValue] = useState(description)
  const { updateProductDescription, isUpdatingProductDescription } = useUpdateProductDescription()

  const handleSubmit = async () => {
    await updateProductDescription({ id: productId, description: value })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent position='top-center' className='sm:max-w-3xl'>
        <DialogHeader>
          <DialogTitle>{t('products.detail.description.editTitle')}</DialogTitle>
        </DialogHeader>
        <RichTextEditor content={value} onChange={setValue} isDisplay isInitialFocus className='min-h-48 max-h-80' />
        <DialogFooter>
          <Button
            type='button'
            variant='outline'
            onClick={() => onOpenChange(false)}
            disabled={isUpdatingProductDescription}
          >
            {t('common.button.cancel')}
          </Button>
          <Button type='button' onClick={() => void handleSubmit()} disabled={isUpdatingProductDescription}>
            {isUpdatingProductDescription ? t('common.button.saving') : t('products.detail.description.save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
