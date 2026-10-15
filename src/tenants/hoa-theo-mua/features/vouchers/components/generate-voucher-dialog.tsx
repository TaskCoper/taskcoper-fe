import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { useUnsavedCloseGuard } from '@/tenants/hoa-theo-mua/features/configs/components/generic/config-dialog-shared'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { FormProvider, useForm, useWatch } from 'react-hook-form'
import type { GenerateVouchersPayload, VoucherProgram } from '../types'
import { generateVoucherSchema } from '../validations'
import {
  VoucherFormFooter,
  VoucherNumberField,
  VoucherSelectField,
  VoucherTextareaField,
  VoucherTextField
} from './voucher-form-fields'

const MAX_QUANTITY_PER_BATCH = 1000

type GenerateFormValues = {
  codePrefix?: string
  codeLength: number
  codeSuffix?: string
  quantity: number
  maxUsageCount: number
  discountType: 'percent' | 'cash'
  discountValue: number
  maxDiscountAmount?: number | null
  description?: string
}

const defaultValues: GenerateFormValues = {
  codePrefix: 'HTM',
  codeLength: 7,
  codeSuffix: '',
  quantity: 1,
  maxUsageCount: 1,
  discountType: 'percent',
  discountValue: 20,
  maxDiscountAmount: null,
  description: ''
}

export function GenerateDialog({
  open,
  program,
  onOpenChange,
  onSubmit,
  pending
}: {
  open: boolean
  program: VoucherProgram | null
  onOpenChange: (open: boolean) => void
  onSubmit: (payload: GenerateVouchersPayload) => void
  pending: boolean
}) {
  const { t } = useTenantTranslation()
  const methods = useForm<GenerateFormValues>({
    mode: 'onChange',
    resolver: zodResolver(generateVoucherSchema(t, MAX_QUANTITY_PER_BATCH)),
    defaultValues
  })
  const {
    control,
    setValue,
    trigger,
    handleSubmit,
    reset,
    formState: { isDirty }
  } = methods
  const discountType = useWatch({ control, name: 'discountType' })
  const requestClose = useUnsavedCloseGuard(isDirty, () => onOpenChange(false))

  useEffect(() => {
    if (open) reset(defaultValues)
  }, [open, reset])

  return (
    <Dialog open={open} onOpenChange={(next) => (next ? onOpenChange(true) : void requestClose())}>
      <DialogContent position='top-center' className='max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-2xl'>
        <DialogHeader>
          <DialogTitle>{t('configsPage.vouchers.generateTitle')}</DialogTitle>
          <DialogDescription>{program?.name}</DialogDescription>
        </DialogHeader>
        <FormProvider {...methods}>
          <form
            noValidate
            onSubmit={handleSubmit((form) => onSubmit(form))}
            className='grid gap-x-4 gap-y-1 sm:grid-cols-2'
          >
            <VoucherTextField
              name='codePrefix'
              control={control}
              label={t('configsPage.vouchers.codePrefix')}
              autoFocus
              toUpperCase
            />
            <VoucherNumberField
              name='codeLength'
              control={control}
              label={t('configsPage.vouchers.codeLength')}
              min={5}
              max={10}
              isRequired
            />
            <VoucherNumberField
              name='quantity'
              control={control}
              label={t('configsPage.vouchers.quantity')}
              min={1}
              max={MAX_QUANTITY_PER_BATCH}
              isRequired
            />
            <VoucherNumberField
              name='maxUsageCount'
              control={control}
              label={t('configsPage.vouchers.maxUsageCount')}
              min={1}
              isRequired
            />
            <VoucherSelectField
              name='discountType'
              control={control}
              label={t('configsPage.vouchers.discountType')}
              isRequired
              options={[
                { value: 'percent', label: t('configsPage.vouchers.kinds.percent') },
                { value: 'cash', label: t('configsPage.vouchers.kinds.cash') }
              ]}
              onValueChange={(value) => {
                if (value === 'cash') setValue('maxDiscountAmount', null)
                void trigger(['discountValue', 'maxDiscountAmount'])
              }}
            />
            <VoucherNumberField
              name='discountValue'
              control={control}
              label={t('configsPage.vouchers.discountValue')}
              suffix={discountType === 'percent' ? '%' : t('configsPage.vouchers.currency')}
              min={0}
              step={discountType === 'cash' ? 0.001 : 1}
              isRequired
            />
            {discountType === 'percent' && (
              <VoucherNumberField
                name='maxDiscountAmount'
                control={control}
                label={t('configsPage.vouchers.maxDiscountAmount')}
                placeholder={t('configsPage.vouchers.unlimited')}
                suffix={t('configsPage.vouchers.currency')}
                min={0}
                nullable
              />
            )}
            <VoucherTextareaField
              name='description'
              control={control}
              label={t('configsPage.vouchers.description')}
              placeholder={t('configsPage.vouchers.descriptionPlaceholder')}
              className='sm:col-span-2'
            />
            <VoucherFormFooter
              label={t('configsPage.vouchers.generate')}
              pending={pending}
              disabled={!program}
              onCancel={() => void requestClose()}
            />
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  )
}
