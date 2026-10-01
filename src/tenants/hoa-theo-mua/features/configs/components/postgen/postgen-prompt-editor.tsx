import RichTextEditor from '@/components/rich-text-editor'
import type { I18nKey } from '@/lib/i18n/types'
import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { useState } from 'react'
import { toast } from 'sonner'
import { buildPostgenDocBody, isBlankPostgenHtml, parsePostgenHtml } from '../../postgen-palette'
import { configKeys } from '../../query-keys'
import configService from '../../services'
import type { Config, PostgenPlatformMeta } from '../../types'
import InlineEditorShell from '../settings/inline-editor-shell'

interface PostgenPromptEditorProps {
  title: string
  description?: string
  icon?: ReactNode
  configKey: string
  label: string
  config: Config | null
  meta?: PostgenPlatformMeta
}

export default function PostgenPromptEditor({
  title,
  description,
  icon,
  configKey,
  label,
  config,
  meta
}: PostgenPromptEditorProps) {
  const { t } = useTenantTranslation()
  const queryClient = useQueryClient()
  // Giữ bản nháp cục bộ để nút lưu chỉ sáng khi nội dung thực sự đổi.
  const [draft, setDraft] = useState<string | null>(null)

  const savedHtml = config ? parsePostgenHtml(config.value.value) : ''
  const html = draft ?? savedHtml
  const isDirty = draft !== null && html !== savedHtml

  const { mutate: savePrompt, isPending: isSaving } = useMutation({
    mutationFn: async () => {
      const body = buildPostgenDocBody({
        key: configKey,
        label: config?.value.label || label,
        // Editor xoá sạch vẫn trả về `<p></p>`; lưu chuỗi rỗng thật thay cho nó.
        html: isBlankPostgenHtml(html) ? '' : html,
        meta,
        isPublic: config?.isPublic ?? false
      })

      if (config) {
        await configService.updateConfig({ id: config.id, body })
        return false
      }

      await configService.createConfig({ body })
      return true
    },
    onSuccess: (isNew) => toast.success(t(isNew ? 'configKeys.toast.created' : 'configKeys.toast.updated')),
    onError: () => toast.error(t('configKeys.toast.error')),
    onSettled: async (saved) => {
      // Lưu lỗi thì để nguyên bản nháp, không mất chữ người dùng đã gõ.
      if (saved === undefined) return

      await queryClient.invalidateQueries({ queryKey: configKeys.all })
      setDraft(null)
    }
  })

  return (
    <InlineEditorShell
      editorId={configKey}
      icon={icon}
      title={title}
      description={description}
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
        placeholder={'configsPage.postgenDialog.contentPlaceholder' as I18nKey}
        displayError={false}
        variant='fullscreen'
      />
    </InlineEditorShell>
  )
}
