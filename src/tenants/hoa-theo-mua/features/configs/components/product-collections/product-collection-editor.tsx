import { Accordion } from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'
import { Field, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useUploadFileWithToast } from '@/hooks/use-upload-file-with-toast'
import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { encodeImageViewport } from '@/lib/image-viewport'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQueryClient } from '@tanstack/react-query'
import { Plus, Trash2 } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Controller, FormProvider, useFieldArray, useForm, useFormContext } from 'react-hook-form'
import { toast } from 'sonner'
import {
  defaultProductCollection,
  defaultProductCollectionCard,
  parseProductCollection,
  PRODUCT_COLLECTION_GROUP,
  PRODUCT_COLLECTION_KEY_PREFIX,
  productCollectionKeySuffix
} from '../../product-collection-palette'
import { configKeys } from '../../query-keys'
import configService from '../../services'
import { ConfigKind, InputType, type Config, type ProductCollection } from '../../types'
import type { SuffixRegistry } from '../../uniqueness'
import {
  productCollectionFormSchema,
  type CreateConfigFormValues,
  type ProductCollectionFormValues
} from '../../validations'
import { usePendingImages } from '../../hooks/use-pending-images'
import InlineEditorShell from '../settings/inline-editor-shell'
import { LocalizedTabs } from '../shared/collection-shared'
import EditorSection from '../shared/editor-section'
import ProductCollectionCardRow from './product-collection-card-row'

interface Props {
  existingConfig: Config | null
  onSaved?: (config: Config | undefined) => void
  /** Bỏ trống khi editor chính là panel của category - lúc đó không có chỗ nào để quay lại. */
  onCancel?: () => void
  registry: SuffixRegistry
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

export default function ProductCollectionEditor({ existingConfig, onSaved, onCancel, registry }: Props) {
  const { t } = useTenantTranslation()
  const queryClient = useQueryClient()
  const { uploadFileWithToast, isUploading } = useUploadFileWithToast()

  const schema = useMemo(
    () =>
      productCollectionFormSchema(t, {
        registry,
        isEditing: Boolean(existingConfig)
      }),
    [t, registry, existingConfig]
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

  // File không serialise được vào form state, nên ảnh chờ upload khoá theo field id của RHF -
  // xoá card qua `useFieldArray.remove()` là entry tương ứng tự mồ côi.
  const pending = usePendingImages()
  const [openCardIds, setOpenCardIds] = useState<string[]>([])
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    reset(toFormValues(existingConfig))
    pending.reset()
    setOpenCardIds([])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [existingConfig, reset])

  const addCard = () => {
    append(defaultProductCollectionCard())
  }

  const removeCard = (index: number) => {
    const fieldId = cardFields[index]?.id
    if (fieldId) pending.clear(fieldId)
    remove(index)
  }

  const moveCard = (from: number, to: number) => {
    if (to < 0 || to >= cardFields.length) return
    swap(from, to)
  }

  const onSubmit = handleSubmit(
    async (values) => {
      // Zod không mô tả được File, nên ràng buộc "phải có ảnh" kiểm tra tay ở đây.
      for (let i = 0; i < values.cards.length; i++) {
        const fieldId = cardFields[i]?.id
        if (!values.cards[i].image && !(fieldId && pending.files[fieldId])) {
          toast.error(t('configsPage.productCollectionDialog.errors.imageRequired', { index: i + 1 }))
          return
        }
      }

      setIsSaving(true)
      try {
        const uploadedCards = [...values.cards]
        for (let i = 0; i < uploadedCards.length; i++) {
          const fieldId = cardFields[i]?.id
          const file = fieldId ? pending.files[fieldId] : undefined
          if (!file) continue
          const url = await uploadFileWithToast({ file, showSuccessToast: false })
          if (!url) {
            setIsSaving(false)
            return
          }
          uploadedCards[i] = {
            ...uploadedCards[i],
            image: encodeImageViewport(url, pending.viewports[fieldId] ?? null)
          }
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
        queryClient.invalidateQueries({ queryKey: configKeys.all })
        if (saved) queryClient.invalidateQueries({ queryKey: ['config', saved.id] })
        reset(methods.getValues())
        onSaved?.(saved)
      } catch {
        toast.error(t('configKeys.toast.error'))
      } finally {
        setIsSaving(false)
      }
    },
    (errors) => {
      const firstMessage = findFirstMessage(errors)
      if (firstMessage) toast.error(firstMessage)
    }
  )

  const submitting = isSaving || isUploading

  // Xoá config đang tạm khoá: nút vẫn hiện nhưng không bấm được.
  const deleteAction = existingConfig ? (
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
  ) : null

  return (
    <InlineEditorShell
      editorId={existingConfig?.key ?? 'new:products'}
      title={t('configsPage.productCollectionDialog.title')}
      description={t('configsPage.productCollectionDialog.subtitle')}
      isDirty={methods.formState.isDirty}
      isSaving={submitting}
      onRevert={() => reset(toFormValues(existingConfig))}
      onSave={() => void onSubmit()}
      onBack={onCancel}
      secondaryAction={deleteAction}
    >
      <FormProvider {...methods}>
        <form onSubmit={onSubmit} className='flex flex-col gap-8'>
          <ConfigLabelField suffix={existingConfig ? productCollectionKeySuffix(existingConfig.key) : undefined} />

          <SectionHeaderForm />

          <EditorSection
            title={t('configsPage.productCollectionDialog.cards.title')}
            description={t('configsPage.productCollectionDialog.cards.subtitle', { count: cardFields.length })}
            action={
              <Button type='button' variant='outline' size='sm' onClick={addCard}>
                <Plus className='size-3.5' data-icon='inline-start' />
                {t('configsPage.productCollectionDialog.cards.add')}
              </Button>
            }
          >
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
                    pendingPreviewUrl={pending.previews[field.id]}
                    pendingViewport={pending.viewports[field.id] ?? null}
                    onPendingViewportChange={(viewport) => pending.setViewport(field.id, viewport)}
                    onRemove={() => removeCard(index)}
                    onMove={(dir) => moveCard(index, index + dir)}
                    onPickFile={(file) => pending.stage(field.id, file)}
                    onClearPendingFile={() => pending.clear(field.id)}
                  />
                ))}
              </Accordion>
            )}
          </EditorSection>
        </form>
      </FormProvider>
    </InlineEditorShell>
  )
}

// `FieldErrors` của RHF là cây lồng nhau, nên phải duyệt sâu để lấy message lỗi đầu tiên.
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
    <EditorSection
      title={t('configsPage.productCollectionDialog.configLabelField')}
      description={t('configsPage.productCollectionDialog.configLabelHelp')}
    >
      <Input
        {...register('label')}
        placeholder={t('configsPage.productCollectionDialog.configLabel', { suffix: suffix || '…' })}
      />
    </EditorSection>
  )
}

function SectionHeaderForm() {
  const { t } = useTenantTranslation()
  const { control, register } = useFormContext<ProductCollectionFormValues>()

  return (
    <EditorSection
      title={t('configsPage.productCollectionDialog.section.title')}
      description={t('configsPage.productCollectionDialog.section.subtitle')}
      action={
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
      }
    >
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
    </EditorSection>
  )
}
