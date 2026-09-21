import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Spinner } from '@/components/ui/spinner'
import { Switch } from '@/components/ui/switch'
import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ImageIcon, Plus, Sparkles } from 'lucide-react'
import { useCallback, useMemo } from 'react'
import { Controller } from 'react-hook-form'
import { toast } from 'sonner'
import {
  buildPostgenEnabledBody,
  isPostgenSystemPromptKey,
  listPostgenPlatforms,
  POSTGEN_ENABLED_KEY,
  POSTGEN_IMAGE_INSTRUCTION_DOC
} from '../../postgen-palette'
import { configKeys } from '../../query-keys'
import configService from '../../services'
import type { Config } from '../../types'
import { useConfigRow } from '../settings/use-config-row'
import CategoryEditorPanel, { type CategoryEditorItem } from '../shared/category-editor-panel'
import ConfigFieldRow from '../shared/config-field-row'
import EditorSection from '../shared/editor-section'
import PostgenPromptEditor from './postgen-prompt-editor'

interface PostgenSectionProps {
  configs: Config[]
  onEditConfig: (config: Config) => void
  /** Pill đang mở, đi qua `useRecordEditor` của trang như mọi họ config khác. */
  selectedKey: string | null
  onSelect: (key: string) => void
}

export default function PostgenSection({ configs, onEditConfig, selectedKey, onSelect }: PostgenSectionProps) {
  const { t } = useTenantTranslation()
  const queryClient = useQueryClient()

  const configByKey = useMemo(() => new Map(configs.map((config) => [config.key, config])), [configs])
  const enabledConfig = configByKey.get(POSTGEN_ENABLED_KEY) ?? null
  const imageInstructionConfig = configByKey.get(POSTGEN_IMAGE_INSTRUCTION_DOC.key) ?? null

  // Nền tảng có sẵn thì có tên đã dịch; nền tảng thêm sau lùi về dùng slug.
  const defaultLabel = useCallback(
    (slug: string) => t(`configsPage.postgenPalette.platforms.${slug}.label`, { defaultValue: slug }),
    [t]
  )

  const platforms = useMemo(() => listPostgenPlatforms(configs, defaultLabel), [configs, defaultLabel])

  // Pill của nền tảng đi kèm logo; doc hướng dẫn ảnh dùng icon chung cho khỏi lẫn với nền tảng.
  const items = useMemo<CategoryEditorItem[]>(
    () => [
      ...platforms.map((platform) => ({
        key: platform.key,
        label: platform.label,
        config: platform.config,
        icon: platform.logo ? (
          <img src={platform.logo} alt='' className='size-4 shrink-0 rounded object-cover' />
        ) : undefined
      })),
      {
        key: POSTGEN_IMAGE_INSTRUCTION_DOC.key,
        label: t('configsPage.postgenPalette.docs.imageInstruction.label'),
        config: imageInstructionConfig,
        icon: <ImageIcon className='size-4 shrink-0' />
      }
    ],
    [platforms, imageInstructionConfig, t]
  )

  const { mutate: createEnabledConfig, isPending: isCreatingEnabledConfig } = useMutation({
    // Mặc định tắt, để bật tính năng luôn là một hành động có chủ đích.
    mutationFn: () =>
      configService.createConfig({
        body: buildPostgenEnabledBody({ label: t('configsPage.postgenPalette.enabled.label'), enabled: false })
      }),
    onSuccess: () => toast.success(t('configKeys.toast.created')),
    onError: () => toast.error(t('configKeys.toast.error')),
    onSettled: () => queryClient.invalidateQueries({ queryKey: configKeys.all })
  })

  // Row không thuộc palette (key tạo tay) vẫn phải vào được.
  const extraConfigs = useMemo(
    () =>
      configs.filter(
        (config) =>
          config.key !== POSTGEN_ENABLED_KEY &&
          config.key !== POSTGEN_IMAGE_INSTRUCTION_DOC.key &&
          !isPostgenSystemPromptKey(config.key)
      ),
    [configs]
  )

  return (
    <section className='flex min-h-0 flex-1 flex-col'>
      <div className='flex shrink-0 items-center gap-2.5 border-b border-border p-4'>
        <div className='min-w-0 flex-1 -space-y-0.5'>
          <h3 className='truncate text-lg font-semibold'>{t('configsPage.category.postgen')}</h3>
          <p className='text-xs text-muted-foreground'>{t('configsPage.postgenPalette.subtitle')}</p>
        </div>
      </div>

      <div className='shrink-0 border-b p-4'>
        {enabledConfig ? (
          <PostgenEnabledRow config={enabledConfig} onEdit={() => onEditConfig(enabledConfig)} />
        ) : (
          <div className='flex w-full items-center gap-3 rounded-xl border border-dashed bg-muted/30 p-3'>
            <span className='flex size-10 shrink-0 items-center justify-center rounded-lg border border-dashed text-muted-foreground'>
              <Sparkles className='size-4' />
            </span>
            <div className='min-w-0 flex-1'>
              <p className='truncate text-sm font-medium text-muted-foreground'>
                {t('configsPage.postgenPalette.enabled.label')}
              </p>
              <p className='truncate font-mono text-xs text-muted-foreground'>{POSTGEN_ENABLED_KEY}</p>
            </div>

            <Button
              type='button'
              variant='outline'
              size='sm'
              className='shrink-0'
              disabled={isCreatingEnabledConfig}
              onClick={() => createEnabledConfig()}
            >
              {isCreatingEnabledConfig ? <Spinner data-icon='inline-start' /> : <Plus data-icon='inline-start' />}
              {t('configsPage.postgenPalette.create')}
            </Button>
          </div>
        )}
      </div>

      <CategoryEditorPanel
        items={items}
        selectedKey={selectedKey}
        onSelect={onSelect}
        navLabel={t('configsPage.postgenPalette.systemPromptsTitle')}
        contentClassName='min-h-0 flex-1'
        footer={
          extraConfigs.length > 0 && (
            <div className='border-t p-4'>
              <EditorSection title={t('configsPage.postgenPalette.otherTitle')} contentClassName='space-y-2'>
                {extraConfigs.map((config) => (
                  <ConfigFieldRow key={config.id} config={config} onEdit={() => onEditConfig(config)} />
                ))}
              </EditorSection>
            </div>
          )
        }
      >
        {(item) => {
          const platform = platforms.find((candidate) => candidate.key === item.key)

          if (!platform) {
            return (
              <PostgenPromptEditor
                key={item.key}
                icon={<ImageIcon className='size-4' />}
                title={t('configsPage.postgenPalette.imageInstruction.title')}
                description={t('configsPage.postgenPalette.imageInstruction.subtitle')}
                configKey={POSTGEN_IMAGE_INSTRUCTION_DOC.key}
                label={t('configsPage.postgenPalette.docs.imageInstruction.label')}
                config={imageInstructionConfig}
              />
            )
          }

          return (
            <PostgenPromptEditor
              key={item.key}
              icon={
                platform.logo ? (
                  <img src={platform.logo} alt='' className='size-5 rounded object-cover' />
                ) : (
                  <Sparkles className='size-4' />
                )
              }
              title={platform.label}
              description={t('configsPage.postgenPalette.systemPromptsSubtitle')}
              configKey={platform.key}
              label={platform.label}
              config={platform.config}
              meta={{ logo: platform.logo, isActive: platform.isActive }}
            />
          )
        }}
      </CategoryEditorPanel>
    </section>
  )
}

function PostgenEnabledRow({ config }: { config: Config; onEdit: () => void }) {
  const { t } = useTenantTranslation()
  const row = useConfigRow(config)
  const { form, rowRef, isSavingValue, saveImmediately } = row

  return (
    <div
      ref={rowRef}
      tabIndex={-1}
      data-config-id={config.id}
      className='flex w-full items-center gap-3 rounded-xl border bg-muted p-3 outline-none'
    >
      <span className='flex size-10 shrink-0 items-center justify-center rounded-lg border bg-background text-foreground'>
        <Sparkles className='size-4' />
      </span>

      <div className='min-w-0 flex-1'>
        <p className='truncate text-sm font-medium'>{config.value.label || config.key}</p>
        <p className='truncate font-mono text-xs text-muted-foreground'>{config.key}</p>
      </div>

      <Controller
        control={form.control}
        name='value'
        render={({ field }) => (
          <Label
            htmlFor={`val-${config.id}`}
            data-dirty-focus
            className='flex shrink-0 cursor-pointer items-center gap-2 text-xs text-muted-foreground'
          >
            {isSavingValue && <Spinner className='size-3.5' />}
            {field.value ? t('configsPage.postgenPalette.enabled.on') : t('configsPage.postgenPalette.enabled.off')}
            <Switch
              id={`val-${config.id}`}
              checked={!!field.value}
              disabled={isSavingValue}
              onCheckedChange={(checked) => {
                field.onChange(checked)
                saveImmediately(checked)
              }}
            />
          </Label>
        )}
      />
    </div>
  )
}
