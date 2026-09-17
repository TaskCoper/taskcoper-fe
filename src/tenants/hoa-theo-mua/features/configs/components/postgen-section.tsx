import RichTextEditor from '@/components/rich-text-editor'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'
import type { I18nKey } from '@/lib/i18n/types'
import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, SaveIcon } from 'lucide-react'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import {
  buildPostgenDocBody,
  buildPostgenEnabledBody,
  isBlankPostgenHtml,
  isPostgenSystemPromptKey,
  parsePostgenHtml,
  POSTGEN_ENABLED_KEY,
  POSTGEN_IMAGE_INSTRUCTION_DOC
} from '../postgen-palette'
import configService from '../services'
import type { Config } from '../types'
import ConfigFieldRow from './config-field-row'
import PostgenSystemPrompts from './postgen-system-prompts'

interface PostgenSectionProps {
  configs: Config[]
  onEditConfig: (config: Config) => void
}

export default function PostgenSection({ configs, onEditConfig }: PostgenSectionProps) {
  const { t } = useTenantTranslation()
  const queryClient = useQueryClient()
  // Keeping a local draft makes the image instruction behave like each system-prompt tab.
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
    // Seeded as off so turning the feature on stays an explicit action.
    mutationFn: () =>
      configService.createConfig({
        body: buildPostgenEnabledBody({ label: t('configsPage.postgenPalette.enabled.label'), enabled: false })
      }),
    onSuccess: () => toast.success(t('configKeys.toast.created')),
    onError: () => toast.error(t('configKeys.toast.error')),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['configs'] })
  })

  const { mutate: saveImageInstruction, isPending: isSavingImageInstruction } = useMutation({
    mutationFn: async () => {
      const body = buildPostgenDocBody({
        key: POSTGEN_IMAGE_INSTRUCTION_DOC.key,
        label: imageInstructionConfig?.value.label || t('configsPage.postgenPalette.docs.imageInstruction.label'),
        // An emptied editor still returns `<p></p>`; store a real empty string instead.
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

      await queryClient.invalidateQueries({ queryKey: ['configs'] })
      setImageInstructionDraft(null)
    }
  })

  // Rows that aren't part of the palette (hand-created keys) still need to be reachable.
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
    <div className='space-y-4'>
      {enabledConfig ? (
        <ConfigFieldRow config={enabledConfig} onEdit={() => onEditConfig(enabledConfig)} />
      ) : (
        <Card className='flex-row items-center gap-3 rounded-2xl border-dashed p-3'>
          <div className='min-w-0 flex-1'>
            <p className='truncate text-sm font-medium'>{t('configsPage.postgenPalette.enabled.label')}</p>
            <p className='mt-0.5 font-mono text-xs text-muted-foreground'>{POSTGEN_ENABLED_KEY}</p>
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
        </Card>
      )}

      <PostgenSystemPrompts configs={configs} />

      <div className='space-y-2'>
        <div className='-space-y-0.5'>
          <p className='font-semibold'>{t('configsPage.postgenPalette.imageInstruction.title')}</p>
          <p className='text-sm text-muted-foreground'>{t('configsPage.postgenPalette.imageInstruction.subtitle')}</p>
        </div>

        <RichTextEditor
          content={imageInstructionHtml}
          onChange={setImageInstructionDraft}
          outputFormat='markdown'
          placeholder={'configsPage.postgenDialog.contentPlaceholder' as I18nKey}
          displayError={false}
        />

        <div className='flex items-center justify-end'>
          <Button
            type='button'
            disabled={!isImageInstructionDirty || isSavingImageInstruction}
            onClick={() => saveImageInstruction()}
          >
            {isSavingImageInstruction ? <Spinner data-icon='inline-start' /> : <SaveIcon data-icon='inline-start' />}
            {t('configsPage.dialog.save')}
          </Button>
        </div>
      </div>

      {extraConfigs.length > 0 && (
        <div className='space-y-3'>
          <p className='text-sm font-semibold'>{t('configsPage.postgenPalette.otherTitle')}</p>
          {extraConfigs.map((config) => (
            <ConfigFieldRow key={config.id} config={config} onEdit={() => onEditConfig(config)} />
          ))}
        </div>
      )}
    </div>
  )
}
