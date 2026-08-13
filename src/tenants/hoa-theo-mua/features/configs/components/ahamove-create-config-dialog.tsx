import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Field, FieldDescription, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Spinner } from '@/components/ui/spinner'
import { Textarea } from '@/components/ui/textarea'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
// import { useConfirmStore } from '@/lib/zustand/confirm.store'
import { SaveIcon, Trash2 } from 'lucide-react'
import { useEffect, useMemo } from 'react'
import { Controller, useForm, useWatch, type SubmitHandler } from 'react-hook-form'
import type { AhamoveServiceRequest } from '../../../types/ahamove.type'
import {
  buildAhamovePayload,
  defaultAhamoveInput,
  localizedAhamoveDescription,
  localizedAhamoveName,
  localizedTierName,
  normalizeAhamoveKey,
  type AhamovePayloadInput
} from '../ahamove-palette'
import { useCreateConfig } from '../hooks/use-create-config'
// import { useDeleteConfig } from '../hooks/use-delete-config'
import { useUpdateConfig } from '../hooks/use-update-config'
import { ConfigKind, InputType, type Config } from '../types'
import type { CreateConfigFormValues } from '../validations'

interface AhamoveCreateConfigDialogProps {
  open: boolean
  onClose: () => void
  request: AhamoveServiceRequest | null
  existingConfig?: Config | null
}

interface AhamoveFormValues {
  label: string
  description: string
  num: number
  tier_code: string
  name: string
  price: number
}

const safeNumber = (value: unknown): number | undefined => {
  const n = Number(value)
  return Number.isFinite(n) ? n : undefined
}

const parseStoredPayload = (raw: unknown): Record<string, unknown> | null => {
  if (raw && typeof raw === 'object') return raw as Record<string, unknown>
  if (typeof raw !== 'string') return null
  try {
    const parsed = JSON.parse(raw)
    return parsed && typeof parsed === 'object' ? parsed : null
  } catch {
    return null
  }
}

export default function AhamoveCreateConfigDialog({
  open,
  onClose,
  request,
  existingConfig
}: AhamoveCreateConfigDialogProps) {
  const { t, i18n } = useTenantTranslation()
  const locale = i18n.language
  const isEdit = !!existingConfig
  // const { confirm } = useConfirmStore()
  const { createConfig, isCreatingConfig } = useCreateConfig()
  const { updateConfig, isUpdatingConfig } = useUpdateConfig(existingConfig?.id)
  // const { deleteConfig, isDeletingConfig } = useDeleteConfig()

  const defaults = useMemo<AhamoveFormValues>(() => {
    if (!request) {
      return { label: '', description: '', num: 1, tier_code: '', name: '', price: 0 }
    }
    const d = defaultAhamoveInput(request)
    const stored = existingConfig ? parseStoredPayload(existingConfig.value.value) : null
    const storedLabel = existingConfig?.value.label
    const storedDescription = existingConfig?.value.description

    return {
      label: storedLabel || localizedAhamoveName(request, locale),
      description: storedDescription ?? localizedAhamoveDescription(request, locale) ?? '',
      num: safeNumber(stored?.num) ?? d.num ?? 1,
      tier_code: (typeof stored?.tier_code === 'string' ? stored.tier_code : undefined) ?? d.tier_code ?? '',
      name:
        (typeof stored?.name === 'string' ? stored.name : undefined) ?? d.name ?? localizedAhamoveName(request, locale),
      price: safeNumber(stored?.price) ?? d.price ?? 0
    }
  }, [request, locale, existingConfig])

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<AhamoveFormValues>({ defaultValues: defaults })

  useEffect(() => {
    if (open) reset(defaults)
  }, [open, defaults, reset])

  const num = useWatch({ control, name: 'num' })
  const tier_code = useWatch({ control, name: 'tier_code' })
  const name = useWatch({ control, name: 'name' })
  const price = useWatch({ control, name: 'price' })

  const previewPayload = useMemo(() => {
    if (!request) return {}
    const input: AhamovePayloadInput = {
      num: safeNumber(num),
      tier_code: tier_code || undefined,
      name: name || undefined,
      price: safeNumber(price)
    }
    return buildAhamovePayload(request, input)
  }, [request, num, tier_code, name, price])

  const jsonPreview = useMemo(() => JSON.stringify(previewPayload, null, 2), [previewPayload])

  const onSubmit: SubmitHandler<AhamoveFormValues> = (values) => {
    if (!request) return
    const body: CreateConfigFormValues = {
      key: existingConfig?.key ?? `ahamove.shipping.${normalizeAhamoveKey(request._id)}`,
      isPublic: existingConfig?.isPublic ?? false,
      group: 'ahamove',
      kind: ConfigKind.setting,
      value: {
        group: 'ahamove',
        label: values.label.trim() || localizedAhamoveName(request, locale),
        inputType: InputType.json,
        description: values.description.trim() || undefined,
        required: false,
        options: [],
        validations: [],
        value: jsonPreview
      }
    }
    if (isEdit) {
      updateConfig({ body }, { onSuccess: onClose })
    } else {
      createConfig({ body }, { onSuccess: onClose })
    }
  }

  // Config deletion is temporarily disabled.
  // const handleDelete = async () => {
  //   if (!existingConfig) return
  //   const confirmed = await confirm({
  //     title: t('configsPage.confirm.deleteTitle'),
  //     description: t('configsPage.confirm.deleteDescription'),
  //     confirmText: t('configsPage.confirm.deleteConfirm'),
  //     cancelText: t('configsPage.confirm.deleteCancel'),
  //     variant: 'destructive'
  //   })
  //   if (!confirmed) return
  //   deleteConfig({ id: existingConfig.id }, { onSuccess: onClose })
  // }

  const requestType = request?.type ?? null
  const requestName = request ? localizedAhamoveName(request, locale) : ''
  const keyPreview = existingConfig?.key ?? (request ? `ahamove.shipping.${normalizeAhamoveKey(request._id)}` : '')
  const isSubmitting = isEdit ? isUpdatingConfig : isCreatingConfig

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent
        position='top-center'
        className='flex max-w-xl flex-col gap-0 p-0 overflow-hidden'
        showCloseButton={false}
      >
        <DialogHeader className='px-6 pt-6 pb-4'>
          <DialogTitle>
            {t('configsPage.ahamoveDialog.title')}
            {requestName ? ` - ${requestName}` : ''}
          </DialogTitle>
        </DialogHeader>

        <div className='min-h-0 flex-1 overflow-y-auto px-6 pb-4'>
          <form id='ahamove-create-config-form' onSubmit={handleSubmit(onSubmit)} className='space-y-3'>
            {/* Identifier — read-only summary */}
            <div className='flex items-center justify-between rounded-md bg-muted/50 p-3 text-xs'>
              <span className='truncate font-mono text-muted-foreground'>{keyPreview}</span>
              {requestType && (
                <span className='ml-2 shrink-0 rounded bg-background px-2 py-0.5 font-medium uppercase tracking-wide'>
                  {requestType}
                </span>
              )}
            </div>

            {/* Label */}
            <Controller
              name='label'
              control={control}
              rules={{ required: t('configsPage.ahamoveDialog.labelRequired') }}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid} className='gap-1'>
                  <FieldLabel htmlFor='ahamove-label'>
                    {t('configsPage.ahamoveDialog.labelField')}
                    <span className='font-semibold text-destructive'>*</span>
                  </FieldLabel>
                  <Input id='ahamove-label' {...field} aria-invalid={fieldState.invalid} />
                  {fieldState.invalid && fieldState.error?.message && (
                    <FieldError className='text-xs' errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            {/* Description */}
            <Field className='gap-1'>
              <FieldLabel htmlFor='ahamove-description'>{t('configsPage.ahamoveDialog.descriptionField')}</FieldLabel>
              <Textarea id='ahamove-description' rows={2} {...register('description')} />
            </Field>

            {/* Type-specific fields */}
            {requestType === 'BOOLEAN' && (
              <Field className='gap-1'>
                <FieldLabel htmlFor='ahamove-num'>{t('configsPage.ahamoveDialog.numField')}</FieldLabel>
                <Input
                  id='ahamove-num'
                  type='number'
                  min={1}
                  step={1}
                  {...register('num', { valueAsNumber: true, min: 1 })}
                  aria-invalid={!!errors.num}
                />
                <FieldDescription>{t('configsPage.ahamoveDialog.numHelp')}</FieldDescription>
              </Field>
            )}

            {requestType === 'TIER' && (
              <Controller
                name='tier_code'
                control={control}
                rules={{ required: t('configsPage.ahamoveDialog.tierRequired') }}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid} className='gap-1'>
                    <FieldLabel>
                      {t('configsPage.ahamoveDialog.tierField')}
                      <span className='font-semibold text-destructive'>*</span>
                    </FieldLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger aria-invalid={fieldState.invalid}>
                        <SelectValue placeholder={t('configsPage.ahamoveDialog.tierPlaceholder')} />
                      </SelectTrigger>
                      <SelectContent>
                        {(request?.tier_list ?? []).map((tier) => (
                          <SelectItem key={tier.code} value={tier.code}>
                            {tier.code} - {localizedTierName(tier, locale)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FieldDescription>{t('configsPage.ahamoveDialog.tierHelp')}</FieldDescription>
                    {fieldState.invalid && fieldState.error?.message && (
                      <FieldError className='text-xs' errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            )}

            {(requestType === 'INPUT' || requestType === 'PER_UNIT') && (
              <>
                <Field className='gap-1'>
                  <FieldLabel htmlFor='ahamove-name'>{t('configsPage.ahamoveDialog.nameField')}</FieldLabel>
                  <Input id='ahamove-name' {...register('name')} />
                  <FieldDescription>{t('configsPage.ahamoveDialog.nameHelp')}</FieldDescription>
                </Field>
                <Field className='gap-1'>
                  <FieldLabel htmlFor='ahamove-price'>{t('configsPage.ahamoveDialog.priceField')}</FieldLabel>
                  <Input
                    id='ahamove-price'
                    type='number'
                    min={0}
                    step={1000}
                    {...register('price', { valueAsNumber: true, min: 0 })}
                  />
                  <FieldDescription>{t('configsPage.ahamoveDialog.priceHelp')}</FieldDescription>
                </Field>
              </>
            )}

            {/* JSON Preview */}
            <Field className='gap-1 pt-2'>
              <FieldLabel>{t('configsPage.ahamoveDialog.jsonPreview')}</FieldLabel>
              <pre className='overflow-x-auto rounded-md border bg-muted p-3 font-mono text-xs leading-relaxed text-foreground'>
                {jsonPreview}
              </pre>
            </Field>
          </form>
        </div>

        <DialogFooter className='pb-6 px-6'>
          {/* Config deletion is temporarily disabled for safety — the button stays visible but inert. */}
          {isEdit && (
            <Tooltip>
              <TooltipTrigger asChild>
                <span className='mr-auto inline-flex'>
                  <Button type='button' variant='destructive' disabled className='pointer-events-none'>
                    <Trash2 className='size-3.5' />
                    {t('configsPage.dialog.delete')}
                  </Button>
                </span>
              </TooltipTrigger>
              <TooltipContent>{t('configsPage.dialog.deleteDisabledTooltip')}</TooltipContent>
            </Tooltip>
          )}
          <Button type='button' variant='outline' disabled={isSubmitting} onClick={onClose}>
            {t('configsPage.dialog.cancel')}
          </Button>
          <Button type='submit' form='ahamove-create-config-form' disabled={isSubmitting || !request}>
            {isSubmitting ? <Spinner data-icon='inline-start' /> : <SaveIcon data-icon='inline-start' />}
            {isSubmitting ? t('configsPage.dialog.saving') : t('configsPage.dialog.save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
