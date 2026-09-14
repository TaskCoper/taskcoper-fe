import SanitizedHtml from '@/components/sanitized-html'
import { Button } from '@/components/ui/button'
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { AlertCircleIcon, CheckIcon, CopyIcon, PencilIcon, RefreshCwIcon } from 'lucide-react'
import { siFacebook, siInstagram, siZalo, type SimpleIcon } from 'simple-icons'
import { useState } from 'react'
import type { SystemPromptDetail } from '../types'

interface SystemPromptCardProps {
  title: string
  description: string
  systemPrompt?: SystemPromptDetail
  isSupported: boolean
  hasPrompt: boolean
  isLoading: boolean
  isListError: boolean
  isDetailError: boolean
  hasCopied: boolean
  onCopy: (content?: string) => void
  onEdit: () => void
  onRetryList: () => void
  onRetryDetail: () => void
  isPlatformRule?: boolean
}

function PromptLoadingState() {
  return (
    <div className='space-y-3 p-5'>
      <Skeleton className='h-4 w-56' />
      <Skeleton className='h-4 w-full' />
      <Skeleton className='h-4 w-5/6' />
      <Skeleton className='h-4 w-2/3' />
    </div>
  )
}

export default function SystemPromptCard({
  title,
  description,
  systemPrompt,
  isSupported,
  hasPrompt,
  isLoading,
  isListError,
  isDetailError,
  hasCopied,
  onCopy,
  onEdit,
  onRetryList,
  onRetryDetail,
  isPlatformRule = false
}: SystemPromptCardProps) {
  const { t } = useTenantTranslation()
  const [platform, setPlatform] = useState<'facebook' | 'zalo' | 'instagram'>('facebook')
  const platformIcons: Record<'facebook' | 'zalo' | 'instagram', SimpleIcon> = {
    facebook: siFacebook,
    zalo: siZalo,
    instagram: siInstagram
  }

  return (
    <Card className='gap-0 overflow-hidden py-0'>
      <CardHeader className='border-b py-5'>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
        {isSupported && systemPrompt && (
          <CardAction className='flex items-center gap-2'>
            <Button
              variant='outline'
              size='sm'
              onClick={() => onCopy(isPlatformRule ? t(`systemPrompts.mockContent.platform.${platform}`) : undefined)}
            >
              {hasCopied ? <CheckIcon /> : <CopyIcon />}
              {t('systemPrompts.actions.copy')}
            </Button>
            <Button variant='outline' size='sm' onClick={onEdit}>
              <PencilIcon />
              {t('systemPrompts.actions.edit')}
            </Button>
          </CardAction>
        )}
      </CardHeader>

      <CardContent className='p-0'>
        {!isSupported ? (
          <div className='flex min-h-72 flex-col items-center justify-center gap-2 px-6 text-center'>
            <div className='rounded-full bg-muted p-3'>
              <AlertCircleIcon className='size-5 text-muted-foreground' />
            </div>
            <p className='font-medium'>{t('systemPrompts.state.comingSoon')}</p>
            <p className='max-w-md text-sm text-muted-foreground'>{t('systemPrompts.state.comingSoonDescription')}</p>
          </div>
        ) : isLoading ? (
          <PromptLoadingState />
        ) : isListError ? (
          <div className='flex min-h-72 flex-col items-center justify-center gap-3 px-6 text-center'>
            <AlertCircleIcon className='size-7 text-destructive' />
            <p className='font-medium'>{t('systemPrompts.state.listError')}</p>
            <Button variant='outline' size='sm' onClick={onRetryList}>
              <RefreshCwIcon />
              {t('systemPrompts.actions.retry')}
            </Button>
          </div>
        ) : !hasPrompt ? (
          <div className='flex min-h-72 items-center justify-center px-6 text-center text-sm text-muted-foreground'>
            {t('systemPrompts.state.notConfigured')}
          </div>
        ) : isDetailError ? (
          <div className='flex min-h-72 flex-col items-center justify-center gap-3 px-6 text-center'>
            <AlertCircleIcon className='size-7 text-destructive' />
            <p className='font-medium'>{t('systemPrompts.state.detailError')}</p>
            <Button variant='outline' size='sm' onClick={onRetryDetail}>
              <RefreshCwIcon />
              {t('systemPrompts.actions.retry')}
            </Button>
          </div>
        ) : (
          <div>
            <div className='flex items-center justify-between border-b bg-muted/20 px-5 py-3'>
              <p className='text-sm font-medium'>{t('systemPrompts.contentLabel')}</p>
              <span className='text-xs text-muted-foreground'>{t('systemPrompts.richTextSupported')}</span>
            </div>
            <div className='space-y-4 p-5'>
              {isPlatformRule && (
                <Tabs value={platform} onValueChange={(value) => setPlatform(value as typeof platform)}>
                  <TabsList className='h-10 justify-start gap-1 rounded-lg border bg-muted/30 p-1'>
                    {(['facebook', 'zalo', 'instagram'] as const).map((item) => (
                      <TabsTrigger key={item} value={item} className='h-8 gap-1.5 px-3 text-xs'>
                        <svg
                          viewBox='0 0 24 24'
                          aria-hidden='true'
                          className='size-4'
                          fill={`#${platformIcons[item].hex}`}
                        >
                          <path d={platformIcons[item].path} />
                        </svg>
                        {t(`systemPrompts.mockContent.platforms.${item}`)}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                  {(['facebook', 'zalo', 'instagram'] as const).map((item) => (
                    <TabsContent key={item} value={item} className='mt-4'>
                      <SanitizedHtml
                        html={t(`systemPrompts.mockContent.platform.${item}`)}
                        className='min-h-72 max-w-none rounded-lg border bg-muted/20 p-5 text-sm leading-7 text-foreground'
                      />
                    </TabsContent>
                  ))}
                </Tabs>
              )}
              {!isPlatformRule && systemPrompt?.content && (
                <SanitizedHtml
                  html={systemPrompt.content}
                  className='min-h-72 max-w-none rounded-lg border bg-muted/20 p-5 text-sm leading-7 text-foreground'
                />
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
