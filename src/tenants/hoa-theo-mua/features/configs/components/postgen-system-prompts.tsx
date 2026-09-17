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
import { buildPostgenDocBody, isBlankPostgenHtml, listPostgenPlatforms, type PostgenPlatform } from '../postgen-palette'
import configService from '../services'
import type { Config } from '../types'

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

  // Built-in platforms have a translated name; anything added later falls back to its slug.
  const defaultLabel = useCallback(
    (slug: string) => t(`configsPage.postgenPalette.platforms.${slug}.label`, { defaultValue: slug }),
    [t]
  )

  const platforms = useMemo(() => listPostgenPlatforms(configs, defaultLabel), [configs, defaultLabel])

  const [activeValue, setActiveValue] = useState('')
  // Kept per slug so switching tabs never throws away an unsaved prompt.
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

  // A saved tab is only dirty against its record; an unsaved one always has something to write.
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
        // An emptied editor still returns `<p></p>`; store a real empty string instead.
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
      // A failed save leaves the tab alone so nothing the user typed is lost.
      if (!saved) return

      await queryClient.invalidateQueries({ queryKey: ['configs'] })

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
      <p className='rounded-2xl border border-dashed py-8 text-center text-sm text-muted-foreground'>
        {t('configsPage.postgenPalette.systemPrompts.empty')}
      </p>
    )
  }

  return (
    <Tabs value={activeTab.value} onValueChange={setActiveValue} className='gap-2 px-0.5'>
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

        {/* <Select
          value={form.isActive ? 'active' : 'inactive'}
          onValueChange={(value) => patchForm({ isActive: value === 'active' })}
        >
          <SelectTrigger
            size='sm'
            className='shrink-0'
            aria-label={t('configsPage.postgenPalette.systemPrompts.statusField')}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent align='end'>
            <SelectItem value='active'>{t('configsPage.postgenPalette.systemPrompts.activeOn')}</SelectItem>
            <SelectItem value='inactive'>{t('configsPage.postgenPalette.systemPrompts.activeOff')}</SelectItem>
          </SelectContent>
        </Select> */}
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

        <div className='flex items-center justify-end'>
          <Button type='button' disabled={!isDirty || isSavingTab} onClick={handleSave}>
            {isSavingTab ? <Spinner data-icon='inline-start' /> : <SaveIcon data-icon='inline-start' />}
            {t('configsPage.dialog.save')}
          </Button>
        </div>
      </TabsContent>
    </Tabs>
  )
}
