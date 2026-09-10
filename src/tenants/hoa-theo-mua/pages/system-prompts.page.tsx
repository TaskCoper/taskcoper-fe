import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { ChevronRightIcon } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router'
import { toast } from 'sonner'
import { HOA_THEO_MUA_ROUTE_PREFIX } from '../config'
import EditSystemPromptDialog from '../features/system-prompts/components/edit-system-prompt-dialog'
import SystemPromptCard from '../features/system-prompts/components/system-prompt-card'
import { useGetSystemPrompt } from '../features/system-prompts/hooks/use-get-system-prompt'
import { useGetSystemPrompts } from '../features/system-prompts/hooks/use-get-system-prompts'
import { SystemPromptType, type SystemPromptType as SystemPromptTypeValue } from '../features/system-prompts/types'

const SystemPromptTab = {
  Flower: 'flower',
  Card: 'card',
  Content: 'content',
  BackgroundRule: 'background-rule',
  ImageToImage: 'image-to-image'
} as const

type SystemPromptTab = (typeof SystemPromptTab)[keyof typeof SystemPromptTab]

interface PromptTabDefinition {
  value: SystemPromptTab
  labelKey: string
  titleKey: string
  descriptionKey: string
  type?: SystemPromptTypeValue
}

const PROMPT_TABS: PromptTabDefinition[] = [
  {
    value: SystemPromptTab.Flower,
    labelKey: 'systemPrompts.tabs.flower.label',
    titleKey: 'systemPrompts.tabs.flower.title',
    descriptionKey: 'systemPrompts.tabs.flower.description',
    type: SystemPromptType.Flower
  },
  {
    value: SystemPromptTab.Card,
    labelKey: 'systemPrompts.tabs.card.label',
    titleKey: 'systemPrompts.tabs.card.title',
    descriptionKey: 'systemPrompts.tabs.card.description',
    type: SystemPromptType.Card
  },
  {
    value: SystemPromptTab.Content,
    labelKey: 'systemPrompts.tabs.content.label',
    titleKey: 'systemPrompts.tabs.content.title',
    descriptionKey: 'systemPrompts.tabs.content.description',
    type: SystemPromptType.Post
  },
  {
    value: SystemPromptTab.BackgroundRule,
    labelKey: 'systemPrompts.tabs.backgroundRule.label',
    titleKey: 'systemPrompts.tabs.backgroundRule.title',
    descriptionKey: 'systemPrompts.tabs.backgroundRule.description'
  },
  {
    value: SystemPromptTab.ImageToImage,
    labelKey: 'systemPrompts.tabs.imageToImage.label',
    titleKey: 'systemPrompts.tabs.imageToImage.title',
    descriptionKey: 'systemPrompts.tabs.imageToImage.description'
  }
]

const htmlToPlainText = (html: string) => {
  const document = new DOMParser().parseFromString(html, 'text/html')

  document.querySelectorAll('br').forEach((node) => node.replaceWith('\n'))
  document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, li, blockquote, pre').forEach((node) => {
    node.insertAdjacentText('afterend', '\n')
  })

  return (document.body.textContent ?? '').replace(/\n{3,}/g, '\n\n').trim()
}

export default function SystemPromptsPage() {
  const { t } = useTenantTranslation()
  const [activeTab, setActiveTab] = useState<SystemPromptTab>(SystemPromptTab.Flower)
  const [hasCopied, setHasCopied] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const { systemPrompts, isGettingSystemPrompts, isSystemPromptsError, refetchSystemPrompts } = useGetSystemPrompts()

  const activeDefinition = PROMPT_TABS.find((tab) => tab.value === activeTab) ?? PROMPT_TABS[0]
  const promptSummary = useMemo(
    () => systemPrompts?.find((prompt) => prompt.type === activeDefinition.type),
    [activeDefinition.type, systemPrompts]
  )
  const { systemPrompt, isGettingSystemPrompt, isSystemPromptError, refetchSystemPrompt } = useGetSystemPrompt(
    promptSummary?.id
  )
  const isSupported = activeDefinition.type !== undefined

  const handleCopy = async () => {
    if (!systemPrompt?.content) return

    try {
      await navigator.clipboard.writeText(htmlToPlainText(systemPrompt.content))
      setHasCopied(true)
      toast.success(t('systemPrompts.toast.copySuccess'))
      window.setTimeout(() => setHasCopied(false), 1500)
    } catch {
      toast.error(t('systemPrompts.toast.copyFailed'))
    }
  }

  return (
    <div className='flex h-full min-h-0 flex-col overflow-auto'>
      <div className='mx-auto w-full max-w-360 space-y-5 p-4 sm:p-6'>
        <div className='space-y-2'>
          <div className='flex items-center gap-1.5 text-xs text-muted-foreground'>
            <Link to={`/${HOA_THEO_MUA_ROUTE_PREFIX}/configs`} className='transition-colors hover:text-foreground'>
              {t('navigation.systemConfigs')}
            </Link>
            <ChevronRightIcon className='size-3.5' />
            <span className='font-medium text-foreground'>{t('navigation.aiSettings.systemPrompts')}</span>
          </div>
          <div>
            <h1 className='text-2xl font-semibold tracking-tight'>{t('systemPrompts.title')}</h1>
            <p className='mt-1 text-sm text-muted-foreground'>{t('systemPrompts.description')}</p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as SystemPromptTab)}>
          <TabsList className='h-auto w-full justify-start gap-6 overflow-x-auto rounded-none border-b bg-transparent p-0'>
            {PROMPT_TABS.map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className='h-11 flex-none rounded-none border-0 border-b-2 border-transparent px-1 text-muted-foreground shadow-none data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none'
              >
                {t(tab.labelKey)}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <SystemPromptCard
          title={t(activeDefinition.titleKey)}
          description={t(activeDefinition.descriptionKey)}
          systemPrompt={systemPrompt}
          isSupported={isSupported}
          hasPrompt={Boolean(promptSummary)}
          isLoading={isGettingSystemPrompts || isGettingSystemPrompt}
          isListError={isSystemPromptsError}
          isDetailError={isSystemPromptError}
          hasCopied={hasCopied}
          onCopy={() => void handleCopy()}
          onEdit={() => setIsEditDialogOpen(true)}
          onRetryList={() => void refetchSystemPrompts()}
          onRetryDetail={() => void refetchSystemPrompt()}
        />
      </div>
      <EditSystemPromptDialog systemPrompt={systemPrompt} open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen} />
    </div>
  )
}
