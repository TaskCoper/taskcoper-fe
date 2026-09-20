import RichTextEditor from '@/components/rich-text-editor'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Spinner } from '@/components/ui/spinner'
import { Switch } from '@/components/ui/switch'
import type { I18nKey } from '@/lib/i18n/types'
import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, SaveIcon, Sparkles } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Controller } from 'react-hook-form'
import { toast } from 'sonner'
import {
  buildPostgenDocBody,
  buildPostgenEnabledBody,
  isBlankPostgenHtml,
  isPostgenSystemPromptKey,
  parsePostgenHtml,
  POSTGEN_ENABLED_KEY,
  POSTGEN_IMAGE_INSTRUCTION_DOC
} from '../../postgen-palette'
import { configKeys } from '../../query-keys'
import configService from '../../services'
import type { Config } from '../../types'
import { useConfigRow } from '../settings/use-config-row'
import ConfigFieldRow from '../shared/config-field-row'
import EditorSection from '../shared/editor-section'
import PostgenSystemPrompts from './postgen-system-prompts'

interface PostgenSectionProps {
  configs: Config[]
  onEditConfig: (config: Config) => void
}

export default function PostgenSection({ configs, onEditConfig }: PostgenSectionProps) {
  const { t } = useTenantTranslation()
  const queryClient = useQueryClient()
  // Giữ bản nháp cục bộ để ô hướng dẫn ảnh hành xử giống các tab system prompt.
  const [imageInstructionDraft, setImageInstructionDraft] = useState<string | null>(null)

  const configByKey = useMemo(() => new Map(configs.map((config) => [config.key, config])), [configs])
  const enabledConfig = configByKey.get(POSTGEN_ENABLED_KEY) ?? null
  const imageInstructionConfig = configByKey.get(POSTGEN_IMAGE_INSTRUCTION_DOC.key) ?? null

  const imageInstructionHtml =
    imageInstructionDraft ?? (imageInstructionConfig ? parsePostgenHtml(imageInstructionConfig.value.value) : '')
  const isImageInstructionDirty =
    imageInstructionDraft !== null &&
    imageInstructionHtml !== (imageInstructionConfig ? parsePostgenHtml(imageInstructionConfig.value.value) : '')

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

  const { mutate: saveImageInstruction, isPending: isSavingImageInstruction } = useMutation({
    mutationFn: async () => {
      const body = buildPostgenDocBody({
        key: POSTGEN_IMAGE_INSTRUCTION_DOC.key,
        label: imageInstructionConfig?.value.label || t('configsPage.postgenPalette.docs.imageInstruction.label'),
        // Editor xoá sạch vẫn trả về `<p></p>`; lưu chuỗi rỗng thật thay cho nó.
        html: isBlankPostgenHtml(imageInstructionHtml) ? '' : imageInstructionHtml,
        isPublic: imageInstructionConfig?.isPublic ?? false
      })

      if (imageInstructionConfig) {
        await configService.updateConfig({ id: imageInstructionConfig.id, body })
        return false
      }

      await configService.createConfig({ body })
      return true
    },
    onSuccess: (isNew) => toast.success(t(isNew ? 'configKeys.toast.created' : 'configKeys.toast.updated')),
    onError: () => toast.error(t('configKeys.toast.error')),
    onSettled: async (saved) => {
      if (saved === undefined) return

      await queryClient.invalidateQueries({ queryKey: configKeys.all })
      setImageInstructionDraft(null)
    }
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
    <section className='flex flex-1 flex-col'>
      <div className='flex items-center gap-2.5 border-b border-border p-4'>
        <div className='min-w-0 flex-1 -space-y-0.5'>
          <h3 className='truncate text-lg font-semibold'>{t('configsPage.category.postgen')}</h3>
          <p className='text-xs text-muted-foreground'>{t('configsPage.postgenPalette.subtitle')}</p>
        </div>
      </div>

      <div className='flex-1 space-y-8 p-4'>
        {enabledConfig ? (
          <PostgenEnabledRow config={enabledConfig} onEdit={() => onEditConfig(enabledConfig)} />
        ) : (
          <EditorSection title={t('configsPage.postgenPalette.enabledSection')}>
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
          </EditorSection>
        )}

        <EditorSection
          title={t('configsPage.postgenPalette.systemPromptsTitle')}
          description={t('configsPage.postgenPalette.systemPromptsSubtitle')}
        >
          <PostgenSystemPrompts configs={configs} />
        </EditorSection>

        <EditorSection
          title={t('configsPage.postgenPalette.imageInstruction.title')}
          description={t('configsPage.postgenPalette.imageInstruction.subtitle')}
          action={
            <Button
              type='button'
              size='sm'
              disabled={!isImageInstructionDirty || isSavingImageInstruction}
              onClick={() => saveImageInstruction()}
            >
              {isSavingImageInstruction ? <Spinner data-icon='inline-start' /> : <SaveIcon data-icon='inline-start' />}
              {t('configsPage.dialog.save')}
            </Button>
          }
        >
          <RichTextEditor
            content={imageInstructionHtml}
            onChange={setImageInstructionDraft}
            outputFormat='markdown'
            placeholder={'configsPage.postgenDialog.contentPlaceholder' as I18nKey}
            displayError={false}
          />
        </EditorSection>

        {extraConfigs.length > 0 && (
          <EditorSection title={t('configsPage.postgenPalette.otherTitle')} contentClassName='space-y-2'>
            {extraConfigs.map((config) => (
              <ConfigFieldRow key={config.id} config={config} onEdit={() => onEditConfig(config)} />
            ))}
          </EditorSection>
        )}
      </div>
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
