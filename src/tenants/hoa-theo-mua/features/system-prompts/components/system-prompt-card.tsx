import SanitizedHtml from '@/components/sanitized-html'
import { Button } from '@/components/ui/button'
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { AlertCircleIcon, CheckIcon, CopyIcon, PencilIcon, RefreshCwIcon } from 'lucide-react'
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
  onCopy: () => void
  onEdit: () => void
  onRetryList: () => void
  onRetryDetail: () => void
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
  onRetryDetail
}: SystemPromptCardProps) {
  const { t } = useTenantTranslation()

  return (
    <Card className='gap-0 overflow-hidden py-0'>
      <CardHeader className='border-b py-5'>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
        {isSupported && systemPrompt && (
          <CardAction className='flex items-center gap-2'>
            <Button variant='outline' size='sm' onClick={onCopy}>
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
            <div className='p-5'>
              {systemPrompt?.content ? (
                <SanitizedHtml
                  html={systemPrompt.content}
                  className='min-h-72 max-w-none rounded-lg border bg-muted/20 p-5 text-sm leading-7 text-foreground'
                />
              ) : (
                <div className='min-h-72 rounded-lg border bg-muted/20 p-5 text-sm text-muted-foreground'>
                  {t('systemPrompts.state.emptyContent')}
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
