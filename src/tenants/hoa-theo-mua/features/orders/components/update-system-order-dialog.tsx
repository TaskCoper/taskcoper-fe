import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { SaveIcon } from 'lucide-react'
import { Controller } from 'react-hook-form'
import { useUpdateOrder } from '../hooks/use-update-order'
import type { EditableSystemOrder } from '../types'

interface UpdateSystemOrderDialogProps {
  order: EditableSystemOrder | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function UpdateSystemOrderDialog({ order, open, onOpenChange }: UpdateSystemOrderDialogProps) {
  const { t } = useTenantTranslation()
  const { methods, onSubmit, isUpdatingOrder } = useUpdateOrder({
    order,
    onSuccess: () => onOpenChange(false)
  })

  const { control } = methods

  return (
    <Dialog open={open} onOpenChange={(next) => !isUpdatingOrder && onOpenChange(next)}>
      <DialogContent className='max-w-md' position='top-center'>
        <DialogHeader>
          <DialogTitle>{t('systemOrders.edit.title')}</DialogTitle>
          <DialogDescription>{t('systemOrders.edit.description')}</DialogDescription>
        </DialogHeader>

        <form id='system-order-edit-form' onSubmit={onSubmit} className='space-y-4'>
          {/* <Controller
            name='trackingNumber'
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid} className='gap-1.5'>
                <FieldLabel htmlFor='system-order-tracking'>{t('systemOrders.edit.trackingNumber')}</FieldLabel>
                <Input
                  {...field}
                  id='system-order-tracking'
                  placeholder={t('systemOrders.edit.trackingNumberPlaceholder')}
                  aria-invalid={fieldState.invalid}
                  autoComplete='off'
                />
                {fieldState.invalid && <FieldError className='text-xs' errors={[fieldState.error]} />}
              </Field>
            )}
          /> */}

          <Controller
            name='ahaMoveTrackingUrl'
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid} className='gap-1.5'>
                <FieldLabel htmlFor='system-order-ahamove'>{t('systemOrders.edit.ahaMoveTrackingUrl')}</FieldLabel>
                <Input
                  {...field}
                  id='system-order-ahamove'
                  type='url'
                  inputMode='url'
                  placeholder={t('systemOrders.edit.ahaMoveTrackingUrlPlaceholder')}
                  aria-invalid={fieldState.invalid}
                  autoComplete='off'
                />
                {fieldState.invalid && <FieldError className='text-xs' errors={[fieldState.error]} />}
              </Field>
            )}
          />

          <Controller
            name='shippingFee'
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid} className='gap-1.5'>
                <FieldLabel htmlFor='system-order-shipping-fee'>{t('systemOrders.edit.shippingFee')}</FieldLabel>
                <Input
                  {...field}
                  id='system-order-shipping-fee'
                  type='number'
                  readOnly
                  inputMode='numeric'
                  min={0}
                  step={1000}
                  placeholder={t('systemOrders.edit.shippingFeePlaceholder')}
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && <FieldError className='text-xs' errors={[fieldState.error]} />}
              </Field>
            )}
          />
        </form>

        <DialogFooter>
          <Button type='button' variant='outline' disabled={isUpdatingOrder} onClick={() => onOpenChange(false)}>
            {t('systemOrders.edit.cancel')}
          </Button>
          <Button type='submit' form='system-order-edit-form' disabled={isUpdatingOrder}>
            {isUpdatingOrder ? <Spinner data-icon='inline-start' /> : <SaveIcon data-icon='inline-start' />}
            {t('systemOrders.edit.save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
