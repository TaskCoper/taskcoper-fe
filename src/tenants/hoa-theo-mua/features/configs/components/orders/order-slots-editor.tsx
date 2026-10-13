import { Field, FieldError } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { Clock3 } from 'lucide-react'
import { useEffect, useMemo } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useGetOrderTags } from '../../hooks/use-get-order-tags'
import { useUpdateOrderSlotLimits } from '../../hooks/use-update-order-slot-limits'
import InlineEditorShell from '../settings/inline-editor-shell'
import EditorSection from '../shared/editor-section'

const ORDER_TAG_TIME_PATTERN = /^\s*\d{1,2}h\s*-\s*\d{1,2}h\s*$/i

type SlotLimits = Record<string, number>
type OrderSlotsFormValues = { limits: SlotLimits }

const normalizeLimits = (options: readonly { value: number }[], limits?: Record<string, number | null>): SlotLimits =>
  Object.fromEntries(options.map((option) => [String(option.value), limits?.[String(option.value)] ?? 0]))

export default function OrderSlotsEditor() {
  const { t } = useTenantTranslation()
  const { orderTagsConfig, isGettingOrderTags, isOrderTagsError } = useGetOrderTags()
  const { updateOrderSlotLimits, isUpdatingOrderSlotLimits } = useUpdateOrderSlotLimits()

  const syncedSlots = useMemo(() => {
    const selectedTagIds = new Set(orderTagsConfig?.value ?? [])

    return (orderTagsConfig?.options ?? []).filter(
      (option) => selectedTagIds.has(option.value) && ORDER_TAG_TIME_PATTERN.test(option.label)
    )
  }, [orderTagsConfig?.options, orderTagsConfig?.value])
  const savedLimits = useMemo(
    () => normalizeLimits(syncedSlots, orderTagsConfig?.slotLimits),
    [orderTagsConfig?.slotLimits, syncedSlots]
  )
  const { control, handleSubmit, reset, formState } = useForm<OrderSlotsFormValues>({
    mode: 'onChange',
    defaultValues: { limits: savedLimits }
  })

  useEffect(() => {
    reset({ limits: savedLimits })
  }, [reset, savedLimits])

  const save = () => {
    void handleSubmit(({ limits }) =>
      updateOrderSlotLimits({
        slots: syncedSlots.map((slot) => ({ tagId: slot.value, limit: limits[String(slot.value)] ?? 0 }))
      })
    )()
  }

  return (
    <InlineEditorShell
      editorId='order-slots-draft'
      icon={<Clock3 className='size-4' />}
      title={t('configsPage.orderSlots.title')}
      description={t('configsPage.orderSlots.description')}
      isDirty={formState.isDirty}
      isSaving={isUpdatingOrderSlotLimits}
      onRevert={() => reset({ limits: savedLimits })}
      onSave={save}
      saveDisabledReason={isGettingOrderTags || isOrderTagsError ? t('configsPage.orderSlots.loadError') : undefined}
    >
      <EditorSection
        title={t('configsPage.orderSlots.slotSection')}
        description={t('configsPage.orderSlots.slotDescription')}
      >
        {syncedSlots.length === 0 ? (
          <div className='rounded-lg border border-dashed px-4 py-8 text-center text-sm text-muted-foreground'>
            {t('configsPage.orderSlots.empty')}
          </div>
        ) : (
          <div className='space-y-2'>
            {syncedSlots.map((slot) => (
              <div
                key={String(slot.value)}
                className='flex min-h-16 items-center gap-3 rounded-xl border bg-card px-3 py-2.5'
              >
                <span className='flex size-10 shrink-0 items-center justify-center rounded-lg border bg-muted/20 text-primary'>
                  <Clock3 className='size-4' />
                </span>

                <div className='min-w-0 flex-1'>
                  <p className='truncate font-medium'>{slot.label.trim()}</p>
                  <p className='truncate text-xs text-muted-foreground'>{t('configsPage.orderSlots.dailyLimitHint')}</p>
                </div>

                <Controller
                  control={control}
                  name={`limits.${slot.value}` as `limits.${string}`}
                  rules={{
                    validate: (value) => {
                      if (value === null || value === undefined) return true
                      if (!Number.isInteger(value)) return t('configsPage.orderSlots.limitIntegerValidation')
                      return value >= 0 || t('common.validation.number.min', { min: 0 })
                    }
                  }}
                  render={({ field, fieldState }) => (
                    <Field className='w-52 shrink-0 gap-1' data-invalid={fieldState.invalid}>
                      <div className='flex items-center gap-2'>
                        <span className='hidden whitespace-nowrap text-xs text-muted-foreground sm:inline'>
                          {t('configsPage.orderSlots.limit')}
                        </span>
                        <Input
                          className='min-w-0 flex-1'
                          type='number'
                          min={0}
                          step={1}
                          inputMode='numeric'
                          value={field.value ?? 0}
                          onBlur={field.onBlur}
                          onChange={(event) =>
                            field.onChange(event.target.value === '' ? 0 : Number(event.target.value))
                          }
                          aria-invalid={fieldState.invalid}
                        />
                      </div>
                      {fieldState.invalid && <FieldError className='text-xs' errors={[fieldState.error]} />}
                    </Field>
                  )}
                />
              </div>
            ))}
          </div>
        )}
      </EditorSection>
    </InlineEditorShell>
  )
}
