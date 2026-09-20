import RichTextEditor from '@/components/rich-text-editor'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { I18nKey } from '@/lib/i18n/types'
import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { SaveIcon } from 'lucide-react'
import { useCallback, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { buildPostgenDocBody, isBlankPostgenHtml, listPostgenPlatforms } from '../../postgen-palette'
import { configKeys } from '../../query-keys'
import configService from '../../services'
import type { Config, PostgenPlatform } from '../../types'

interface PostgenSystemPromptsProps {
  configs: Config[]
}

interface PlatformDraft {
  html: string
  isActive: boolean
}

type TabItem = { value: string; platform: PostgenPlatform }

const toDraft = (platform: PostgenPlatform): PlatformDraft => ({
  html: platform.html,
  isActive: platform.isActive
})

export default function PostgenSystemPrompts({ configs }: PostgenSystemPromptsProps) {
  const { t } = useTenantTranslation()
  const queryClient = useQueryClient()

  // Nền tảng có sẵn thì có tên đã dịch; nền tảng thêm sau lùi về dùng slug.
  const defaultLabel = useCallback(
    (slug: string) => t(`configsPage.postgenPalette.platforms.${slug}.label`, { defaultValue: slug }),
    [t]
  )

  const platforms = useMemo(() => listPostgenPlatforms(configs, defaultLabel), [configs, defaultLabel])

  const [activeValue, setActiveValue] = useState('')
  // Giữ theo từng slug để đổi tab không làm mất prompt chưa lưu.
  const [drafts, setDrafts] = useState<Record<string, PlatformDraft>>({})

  const tabs = useMemo<TabItem[]>(
    () => platforms.map<TabItem>((platform) => ({ value: platform.slug, platform })),
    [platforms]
  )

  const getTabForm = (tab: TabItem): PlatformDraft => drafts[tab.platform.slug] ?? toDraft(tab.platform)

  const activeTab = tabs.find((tab) => tab.value === activeValue) ?? tabs[0] ?? null
  const form: PlatformDraft | null = activeTab ? getTabForm(activeTab) : null

  const patchTabForm = (tab: TabItem, patch: Partial<PlatformDraft>) => {
    const { slug } = tab.platform
    setDrafts((current) => ({ ...current, [slug]: { ...(current[slug] ?? toDraft(tab.platform)), ...patch } }))
  }

  const patchForm = (patch: Partial<PlatformDraft>) => {
    if (activeTab) patchTabForm(activeTab, patch)
  }

  // Tab đã lưu chỉ dirty khi lệch với record của nó; tab chưa lưu thì luôn có cái để ghi.
  const isDirty =
    !!activeTab && !!form && (form.html !== activeTab.platform.html || form.isActive !== activeTab.platform.isActive)

  const { mutate: saveTab, isPending: isSavingTab } = useMutation({
    mutationFn: async () => {
      if (!activeTab || !form) throw new Error('no active tab')

      const { platform } = activeTab
      const existingConfig = platform.config

      const body = buildPostgenDocBody({
        key: platform.key,
        label: platform.label,
        // Editor xoá sạch vẫn trả về `<p></p>`; lưu chuỗi rỗng thật thay cho nó.
        html: isBlankPostgenHtml(form.html) ? '' : form.html,
        meta: { logo: platform.logo, isActive: form.isActive },
        isPublic: existingConfig?.isPublic ?? false
      })

      if (existingConfig) {
        await configService.updateConfig({ id: existingConfig.id, body })
      } else {
        await configService.createConfig({ body })
      }

      return { slug: platform.slug, isNew: !existingConfig }
    },
    onSuccess: ({ isNew }) => toast.success(t(isNew ? 'configKeys.toast.created' : 'configKeys.toast.updated')),
    onError: () => toast.error(t('configKeys.toast.error')),
    onSettled: async (saved) => {
      // Lưu lỗi thì để nguyên tab, không mất chữ người dùng đã gõ.
      if (!saved) return

      await queryClient.invalidateQueries({ queryKey: configKeys.all })

      setDrafts((current) => {
        const next = { ...current }
        delete next[saved.slug]
        return next
      })
    }
  })

  const handleSave = () => {
    if (!activeTab || !form) return
    saveTab()
  }

  const tabLabel = (tab: TabItem): string => tab.platform.label

  const tabLogo = (tab: TabItem): string => tab.platform.logo

  if (!activeTab || !form) {
    return (
      <p className='rounded-xl border border-dashed py-12 text-center text-sm text-muted-foreground'>
        {t('configsPage.postgenPalette.systemPrompts.empty')}
      </p>
    )
  }

  return (
    <Tabs value={activeTab.value} onValueChange={setActiveValue} className='gap-2'>
      <div className='flex min-w-0 items-center justify-between gap-2'>
        <div className='min-w-0 flex-1 overflow-x-auto'>
          <TabsList className='flex items-center gap-2'>
            {tabs.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value} className='min-w-32 shrink-0'>
                {tabLogo(tab) && <img src={tabLogo(tab)} alt='' className='size-4 rounded object-cover' />}
                <span className='truncate'>{tabLabel(tab)}</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <Button type='button' size='sm' disabled={!isDirty || isSavingTab} onClick={handleSave}>
          {isSavingTab ? <Spinner data-icon='inline-start' /> : <SaveIcon data-icon='inline-start' />}
          {t('configsPage.dialog.save')}
        </Button>
      </div>

      <TabsContent value={activeTab.value} className='space-y-2'>
        <RichTextEditor
          key={activeTab.value}
          content={form.html}
          onChange={(value) => patchForm({ html: value })}
          outputFormat='markdown'
          placeholder={'configsPage.postgenDialog.contentPlaceholder' as I18nKey}
          displayError={false}
        />
      </TabsContent>
    </Tabs>
  )
}
