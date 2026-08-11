import { Accordion } from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'
import { Field, FieldDescription, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Spinner } from '@/components/ui/spinner'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useUploadFileWithToast } from '@/hooks/use-upload-file-with-toast'
import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
// import { useConfirmStore } from '@/lib/zustand/confirm.store'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQueryClient } from '@tanstack/react-query'
import { Plus, SaveIcon, Trash2 } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Controller, FormProvider, useFieldArray, useForm, useFormContext } from 'react-hook-form'
import { toast } from 'sonner'
// import { useDeleteConfig } from '../hooks/use-delete-config'
import {
  defaultProductCollection,
  defaultProductCollectionCard,
  parseProductCollection,
  PRODUCT_COLLECTION_GROUP,
  PRODUCT_COLLECTION_KEY_PREFIX,
  productCollectionKeySuffix,
  type ProductCollection
} from '../product-collection-palette'
import configService from '../services'
import { ConfigKind, InputType, type Config } from '../types'
import {
  productCollectionFormSchema,
  type CreateConfigFormValues,
  type ProductCollectionFormValues
} from '../validations'
import { CollectionKeyField, LocalizedTabs } from './collection-shared'
import ProductCollectionCardRow from './product-collection-card-row'

interface Props {
  existingConfig: Config | null
  onSaved?: (config: Config | undefined) => void
  onCancel?: () => void
  takenSuffixes?: Set<string>
}

const toFormValues = (existingConfig: Config | null): ProductCollectionFormValues => {
  const parsed = existingConfig ? parseProductCollection(existingConfig.value.value) : defaultProductCollection()
  return {
    keySuffix: existingConfig ? productCollectionKeySuffix(existingConfig.key) : '',
    label: existingConfig?.value.label ?? '',
    section: parsed.section,
    hasCampaigns: parsed.hasCampaigns,
    cards: parsed.cards
  }
}

export default function ProductCollectionEditor({ existingConfig, onSaved, onCancel, takenSuffixes }: Props) {
  const { t } = useTenantTranslation()
  const queryClient = useQueryClient()
  const { uploadFileWithToast, isUploading } = useUploadFileWithToast()
  // const { confirm } = useConfirmStore()
  // const { deleteConfig, isDeletingConfig } = useDeleteConfig()

  const schema = useMemo(
    () =>
      productCollectionFormSchema(t, {
        takenSuffixes: takenSuffixes ?? new Set(),
        isEditing: Boolean(existingConfig)
      }),
    [t, takenSuffixes, existingConfig]
  )

  const methods = useForm<ProductCollectionFormValues>({
    resolver: zodResolver(schema),
    defaultValues: toFormValues(existingConfig)
  })
  const { control, handleSubmit, reset } = methods

  const {
    fields: cardFields,
    append,
    remove,
    swap
  } = useFieldArray({
    control,
    name: 'cards'
  })

  // File uploads live outside the form (Files aren't JSON-serialisable). Keyed by RHF field id
  // so an entry auto-orphans when the associated card is removed via useFieldArray.remove().
  const [pendingFiles, setPendingFiles] = useState<Record<string, File>>({})
  const [pendingPreviews, setPendingPreviews] = useState<Record<string, string>>({})
  const [openCardIds, setOpenCardIds] = useState<string[]>([])
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    reset(toFormValues(existingConfig))
    setPendingFiles({})
    setPendingPreviews((prev) => {
      Object.values(prev).forEach(URL.revokeObjectURL)
      return {}
    })
    // Load-time convenience: expand the only card automatically.
    setOpenCardIds([])
  }, [existingConfig, reset])

  useEffect(() => {
    return () => {
      Object.values(pendingPreviews).forEach(URL.revokeObjectURL)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const addCard = () => {
    append(defaultProductCollectionCard())
  }

  const removeCard = (index: number) => {
    const fieldId = cardFields[index]?.id
    if (fieldId) clearPendingFile(fieldId)
    remove(index)
  }

  const moveCard = (from: number, to: number) => {
    if (to < 0 || to >= cardFields.length) return
    swap(from, to)
  }

  const setPendingFileForCard = (fieldId: string, file: File) => {
    setPendingFiles((prev) => ({ ...prev, [fieldId]: file }))
    setPendingPreviews((prev) => {
      if (prev[fieldId]) URL.revokeObjectURL(prev[fieldId])
      return { ...prev, [fieldId]: URL.createObjectURL(file) }
    })
  }

  const clearPendingFile = (fieldId: string) => {
    setPendingPreviews((prev) => {
      if (prev[fieldId]) URL.revokeObjectURL(prev[fieldId])
      const next = { ...prev }
      delete next[fieldId]
      return next
    })
    setPendingFiles((prev) => {
      const next = { ...prev }
      delete next[fieldId]
      return next
    })
  }

  const onSubmit = handleSubmit(
    async (values) => {
      // Image presence is checked here because Files can't be modelled in Zod.
      for (let i = 0; i < values.cards.length; i++) {
        const fieldId = cardFields[i]?.id
        if (!values.cards[i].image && !(fieldId && pendingFiles[fieldId])) {
          toast.error(t('configsPage.productCollectionDialog.errors.imageRequired', { index: i + 1 }))
          return
        }
      }

      setIsSaving(true)
      try {
        const uploadedCards = [...values.cards]
        for (let i = 0; i < uploadedCards.length; i++) {
          const fieldId = cardFields[i]?.id
          const pending = fieldId ? pendingFiles[fieldId] : undefined
          if (!pending) continue
          const url = await uploadFileWithToast({ file: pending, showSuccessToast: false })
          if (!url) {
            setIsSaving(false)
            return
          }
          uploadedCards[i] = { ...uploadedCards[i], image: url }
        }

        const resolved: ProductCollection = {
          section: values.section,
          hasCampaigns: values.hasCampaigns,
          cards: uploadedCards
        }

        const suffix = existingConfig ? productCollectionKeySuffix(existingConfig.key) : values.keySuffix.trim()
        const composedKey = existingConfig ? existingConfig.key : `${PRODUCT_COLLECTION_KEY_PREFIX}${suffix}`
        const body: CreateConfigFormValues = {
          key: composedKey,
          isPublic: true,
          kind: ConfigKind.content,
          group: PRODUCT_COLLECTION_GROUP,
          value: {
            group: PRODUCT_COLLECTION_GROUP,
            label: values.label.trim() || t('configsPage.productCollectionDialog.configLabel', { suffix }),
            inputType: InputType.json,
            required: false,
            options: [],
            validations: [],
            value: JSON.stringify(resolved)
          }
        }

        const saved = existingConfig
          ? await configService.updateConfig({ id: existingConfig.id, body })
          : await configService.createConfig({ body })

        toast.success(t(existingConfig ? 'configKeys.toast.updated' : 'configKeys.toast.created'))
        queryClient.invalidateQueries({ queryKey: ['configs'] })
        if (saved) queryClient.invalidateQueries({ queryKey: ['config', saved.id] })
        onSaved?.(saved)
      } catch {
        toast.error(t('configKeys.toast.error'))
      } finally {
        setIsSaving(false)
      }
    },
    (errors) => {
      // Surface first schema issue as a toast, mirroring the pattern used before the RHF refactor.
      const firstMessage = findFirstMessage(errors)
      if (firstMessage) toast.error(firstMessage)
    }
  )

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
  //   deleteConfig(
  //     { id: existingConfig.id },
  //     {
  //       onSuccess: () => {
  //         queryClient.invalidateQueries({ queryKey: ['configs'] })
  //         onSaved?.(undefined)
  //       }
  //     }
  //   )
  // }

  const submitting = isSaving || isUploading

  return (
    <FormProvider {...methods}>
      <form onSubmit={onSubmit} className='flex flex-col gap-4'>
        <Controller
          control={control}
          name='keySuffix'
          render={({ field, fieldState }) => (
            <CollectionKeyField
              prefix={PRODUCT_COLLECTION_KEY_PREFIX}
              suffix={field.value}
              onChange={field.onChange}
              locked={Boolean(existingConfig)}
              label={t('configsPage.collectionKey.field')}
              placeholder={t('configsPage.productCollectionDialog.keyPlaceholder')}
              description={t('configsPage.collectionKey.description')}
              takenSuffixes={takenSuffixes}
              duplicateHint={t('configsPage.collectionKey.errors.duplicate')}
              invalidHint={t('configsPage.collectionKey.errors.invalid')}
              requiredHint={fieldState.error?.message ?? t('configsPage.collectionKey.errors.required')}
            />
          )}
        />

        <ConfigLabelField suffix={existingConfig ? productCollectionKeySuffix(existingConfig.key) : undefined} />

        {/* Campaign UI is temporarily disabled (products.mainline / products.featured).
            The `hasCampaigns` flag and per-card campaigns are still parsed and re-saved
            untouched, so nothing is lost while the toggle is hidden. */}
        {/* <CampaignsToggle /> */}

        <SectionHeaderForm />

        <div className='flex items-center justify-between'>
          <div>
            <div className='text-sm font-semibold'>{t('configsPage.productCollectionDialog.cards.title')}</div>
            <div className='text-xs text-muted-foreground'>
              {t('configsPage.productCollectionDialog.cards.subtitle', { count: cardFields.length })}
            </div>
          </div>
          <Button type='button' variant='outline' size='sm' onClick={addCard}>
            <Plus className='size-3.5' data-icon='inline-start' />
            {t('configsPage.productCollectionDialog.cards.add')}
          </Button>
        </div>

        {cardFields.length === 0 ? (
          <div className='rounded-xl border border-dashed py-12 text-center text-sm text-muted-foreground'>
            {t('configsPage.productCollectionDialog.cards.empty')}
          </div>
        ) : (
          <Accordion
            type='multiple'
            value={openCardIds}
            onValueChange={setOpenCardIds}
            className='space-y-2 rounded-2xl'
          >
            {cardFields.map((field, index) => (
              <ProductCollectionCardRow
                key={field.id}
                fieldId={field.id}
                index={index}
                total={cardFields.length}
                pendingPreviewUrl={pendingPreviews[field.id]}
                onRemove={() => removeCard(index)}
                onMove={(dir) => moveCard(index, index + dir)}
                onPickFile={(file) => setPendingFileForCard(field.id, file)}
                onClearPendingFile={() => clearPendingFile(field.id)}
              />
            ))}
          </Accordion>
        )}

        <div className='flex items-center justify-between gap-2 border-t pt-4'>
          {/* Config deletion is temporarily disabled for safety — the button stays visible but inert. */}
          {existingConfig ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <span className='inline-flex'>
                  <Button type='button' variant='destructive' disabled className='pointer-events-none'>
                    <Trash2 className='size-3.5' data-icon='inline-start' />
                    {t('configsPage.dialog.delete')}
                  </Button>
                </span>
              </TooltipTrigger>
              <TooltipContent>{t('configsPage.dialog.deleteDisabledTooltip')}</TooltipContent>
            </Tooltip>
          ) : (
            <span />
          )}
          <div className='flex gap-2'>
            {onCancel && (
              <Button type='button' variant='outline' disabled={submitting} onClick={onCancel}>
                {t('configsPage.dialog.cancel')}
              </Button>
            )}
            <Button type='submit' disabled={submitting}>
              {isSaving || isUploading ? <Spinner data-icon='inline-start' /> : <SaveIcon data-icon='inline-start' />}
              {isSaving || isUploading ? t('configsPage.dialog.saving') : t('configsPage.dialog.save')}
            </Button>
          </div>
        </div>
      </form>
    </FormProvider>
  )
}

// Depth-first hunt for the first schema issue message. RHF's FieldErrors is a nested tree.
type ErrorLike = { message?: string } | Record<string, unknown> | undefined
const findFirstMessage = (errors: ErrorLike): string | undefined => {
  if (!errors || typeof errors !== 'object') return undefined
  const bag = errors as Record<string, unknown>
  if (typeof bag.message === 'string' && bag.message) return bag.message
  for (const key of Object.keys(bag)) {
    if (key === 'ref' || key === 'type' || key === 'types') continue
    const found = findFirstMessage(bag[key] as ErrorLike)
    if (found) return found
  }
  return undefined
}

function ConfigLabelField({ suffix }: { suffix?: string }) {
  const { t } = useTenantTranslation()
  const { register } = useFormContext<ProductCollectionFormValues>()

  return (
    <Field className='gap-1'>
      <FieldLabel className='text-xs'>{t('configsPage.productCollectionDialog.configLabelField')}</FieldLabel>
      <Input
        {...register('label')}
        placeholder={t('configsPage.productCollectionDialog.configLabel', { suffix: suffix || '…' })}
      />
      <FieldDescription className='text-xs'>
        {t('configsPage.productCollectionDialog.configLabelHelp')}
      </FieldDescription>
    </Field>
  )
}

// Campaign UI temporarily disabled — see the commented <CampaignsToggle /> above.
// function CampaignsToggle() {
//   const { t } = useTenantTranslation()
//   const { control } = useFormContext<ProductCollectionFormValues>()
//   return (
//     <Controller
//       control={control}
//       name='hasCampaigns'
//       render={({ field }) => (
//         <Field className='flex-row items-center justify-between rounded-xl border bg-muted/30 p-4'>
//           <div>
//             <div className='text-sm font-semibold'>
//               {t('configsPage.productCollectionDialog.campaignsToggle.title')}
//             </div>
//             <FieldDescription className='text-xs w-full'>
//               {t('configsPage.productCollectionDialog.campaignsToggle.description')}
//             </FieldDescription>
//           </div>
//           <Label className='flex items-center gap-2 text-xs text-muted-foreground justify-end'>
//             {t('configsPage.productCollectionDialog.campaignsToggle.label')}
//             <Switch checked={field.value} onCheckedChange={field.onChange} />
//           </Label>
//         </Field>
//       )}
//     />
//   )
// }

function SectionHeaderForm() {
  const { t } = useTenantTranslation()
  const { control, register } = useFormContext<ProductCollectionFormValues>()

  return (
    <div className='rounded-xl border bg-muted/30 p-4'>
      <div className='mb-3 flex items-center justify-between'>
        <div>
          <div className='text-sm font-semibold'>{t('configsPage.productCollectionDialog.section.title')}</div>
          <div className='text-xs text-muted-foreground'>
            {t('configsPage.productCollectionDialog.section.subtitle')}
          </div>
        </div>
        <Controller
          control={control}
          name='section.enabled'
          render={({ field }) => (
            <Label className='flex items-center gap-2 text-xs text-muted-foreground'>
              {t('configsPage.productCollectionDialog.section.enabled')}
              <Switch checked={field.value} onCheckedChange={field.onChange} />
            </Label>
          )}
        />
      </div>

      <LocalizedTabs
        viLabel={t('configsPage.productCollectionDialog.locale.vi')}
        enLabel={t('configsPage.productCollectionDialog.locale.en')}
        renderField={(lang) => (
          <div className='space-y-2'>
            <Field className='gap-1'>
              <FieldLabel>{t('configsPage.productCollectionDialog.section.titleField')}</FieldLabel>
              <Input
                {...register(`section.title.${lang}` as const)}
                placeholder={t('configsPage.productCollectionDialog.section.titlePlaceholder')}
              />
            </Field>
            <Field className='gap-1'>
              <FieldLabel>{t('configsPage.productCollectionDialog.section.descriptionField')}</FieldLabel>
              <Textarea
                rows={2}
                {...register(`section.description.${lang}` as const)}
                placeholder={t('configsPage.productCollectionDialog.section.descriptionPlaceholder')}
              />
            </Field>
          </div>
        )}
      />
    </div>
  )
}
