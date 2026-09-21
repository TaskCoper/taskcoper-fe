import RichTextEditor from '@/components/rich-text-editor'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import type { I18nKey } from '@/lib/i18n/types'
import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ImagePlus, Plus } from 'lucide-react'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import {
  buildImagegenDocBody,
  IMAGEGEN_CARD_PROMPT_KEY,
  IMAGEGEN_FLOWER_CREATE_PROMPT_KEY,
  IMAGEGEN_FLOWER_GUARD_PROMPT_KEY,
  IMAGEGEN_FLOWER_MOCKUP_PROMPT_KEY,
  isBlankImagegenHtml,
  isImagegenPromptKey,
  parseImagegenHtml
} from '../../imagegen-palette'
import { configKeys } from '../../query-keys'
import configService from '../../services'
import type { Config } from '../../types'
import InlineEditorShell from '../settings/inline-editor-shell'
import CategoryEditorPanel, { type CategoryEditorItem } from '../shared/category-editor-panel'
import ConfigFieldRow from '../shared/config-field-row'
import EditorSection from '../shared/editor-section'

const PROMPT_DOCS = [
  { configKey: IMAGEGEN_FLOWER_CREATE_PROMPT_KEY, i18nGroup: 'flowerCreate' },
  { configKey: IMAGEGEN_FLOWER_MOCKUP_PROMPT_KEY, i18nGroup: 'flowerMockup' },
  { configKey: IMAGEGEN_FLOWER_GUARD_PROMPT_KEY, i18nGroup: 'flowerGuard' },
  { configKey: IMAGEGEN_CARD_PROMPT_KEY, i18nGroup: 'card' }
] as const

interface ImagegenSectionProps {
  configs: Config[]
  onEditConfig: (config: Config) => void
  selectedKey: string | null
  onSelect: (key: string) => void
}

export default function ImagegenSection({ configs, onEditConfig, selectedKey, onSelect }: ImagegenSectionProps) {
  const { t } = useTenantTranslation()

  const configByKey = useMemo(() => new Map(configs.map((config) => [config.key, config])), [configs])

  const items = useMemo<CategoryEditorItem[]>(
    () =>
      PROMPT_DOCS.map(({ configKey, i18nGroup }) => ({
        key: configKey,
        label: t(`configsPage.imagegenPalette.${i18nGroup}.label`),
        config: configByKey.get(configKey) ?? null,
        icon: <ImagePlus className='size-4 shrink-0' />
      })),
    [configByKey, t]
  )

  // Record key tạo tay vẫn phải vào sửa được.
  const extraConfigs = useMemo(() => configs.filter((config) => !isImagegenPromptKey(config.key)), [configs])

  return (
    <section className='flex min-h-0 flex-1 flex-col'>
      <div className='flex shrink-0 items-center gap-2.5 border-b border-border p-4'>
        <div className='min-w-0 flex-1 -space-y-0.5'>
          <h3 className='truncate text-lg font-semibold'>{t('configsPage.category.imagegen')}</h3>
          <p className='text-xs text-muted-foreground'>{t('configsPage.imagegenPalette.subtitle')}</p>
        </div>
      </div>

      <CategoryEditorPanel
        items={items}
        selectedKey={selectedKey}
        onSelect={onSelect}
        navLabel={t('configsPage.category.imagegen')}
        contentClassName='min-h-0 flex-1'
        footer={
          extraConfigs.length > 0 && (
            <div className='border-t p-4'>
              <EditorSection title={t('configsPage.imagegenPalette.otherTitle')} contentClassName='space-y-2'>
                {extraConfigs.map((config) => (
                  <ConfigFieldRow key={config.id} config={config} onEdit={() => onEditConfig(config)} />
                ))}
              </EditorSection>
            </div>
          )
        }
      >
        {(item) => {
          const doc = PROMPT_DOCS.find((prompt) => prompt.configKey === item.key)
          if (!doc) return null

          return (
            <ImagegenPromptEditor key={item.key} configKey={item.key} i18nGroup={doc.i18nGroup} config={item.config} />
          )
        }}
      </CategoryEditorPanel>
    </section>
  )
}

interface ImagegenPromptEditorProps {
  configKey: string
  i18nGroup: string
  config: Config | null
}

function ImagegenPromptEditor({ configKey, i18nGroup, config }: ImagegenPromptEditorProps) {
  const { t } = useTenantTranslation()
  const queryClient = useQueryClient()
  // Giữ bản nháp cục bộ để nút lưu chỉ sáng khi nội dung thực sự đổi.
  const [draft, setDraft] = useState<string | null>(null)

  const label = t(`configsPage.imagegenPalette.${i18nGroup}.label`)
  const savedHtml = config ? parseImagegenHtml(config.value.value) : ''
  const html = draft ?? savedHtml
  const isDirty = draft !== null && html !== savedHtml

  const { mutate: createPrompt, isPending: isCreating } = useMutation({
    // Tạo rỗng trước, nội dung soạn sau ở ngay editor bên dưới.
    mutationFn: () => configService.createConfig({ body: buildImagegenDocBody({ key: configKey, label, html: '' }) }),
    onSuccess: () => toast.success(t('configKeys.toast.created')),
    onError: () => toast.error(t('configKeys.toast.error')),
    onSettled: () => queryClient.invalidateQueries({ queryKey: configKeys.all })
  })

  const { mutate: savePrompt, isPending: isSaving } = useMutation({
    mutationFn: async () => {
      if (!config) return

      await configService.updateConfig({
        id: config.id,
        body: buildImagegenDocBody({
          key: config.key,
          label: config.value.label || label,
          // Editor xoá sạch vẫn trả về `<p></p>`; lưu chuỗi rỗng thật thay cho nó.
          html: isBlankImagegenHtml(html) ? '' : html,
          isPublic: config.isPublic ?? false
        })
      })
    },
    onSuccess: () => toast.success(t('configKeys.toast.updated')),
    onError: () => toast.error(t('configKeys.toast.error')),
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: configKeys.all })
      setDraft(null)
    }
  })

  if (!config) {
    return (
      <div className='p-4'>
        <div className='flex w-full items-center gap-3 rounded-xl border border-dashed bg-muted/30 p-3'>
          <span className='flex size-10 shrink-0 items-center justify-center rounded-lg border border-dashed text-muted-foreground'>
            <ImagePlus className='size-4' />
          </span>

          <div className='min-w-0 flex-1'>
            <p className='truncate text-sm font-medium text-muted-foreground'>{label}</p>
            <p className='truncate font-mono text-xs text-muted-foreground'>{configKey}</p>
          </div>

          <Button
            type='button'
            variant='outline'
            size='sm'
            className='shrink-0'
            disabled={isCreating}
            onClick={() => createPrompt()}
          >
            {isCreating ? <Spinner data-icon='inline-start' /> : <Plus data-icon='inline-start' />}
            {t('configsPage.imagegenPalette.create')}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <InlineEditorShell
      editorId={configKey}
      icon={<ImagePlus className='size-4' />}
      title={t(`configsPage.imagegenPalette.${i18nGroup}.title`)}
      description={t(`configsPage.imagegenPalette.${i18nGroup}.subtitle`)}
      isDirty={isDirty}
      isSaving={isSaving}
      onRevert={() => setDraft(null)}
      onSave={() => savePrompt()}
      contentClassName='flex min-h-0 flex-col space-y-0 p-0'
    >
      <RichTextEditor
        content={html}
        onChange={setDraft}
        outputFormat='markdown'
        placeholder={'configsPage.imagegenPalette.contentPlaceholder' as I18nKey}
        displayError={false}
        variant='fullscreen'
      />
    </InlineEditorShell>
  )
}
