import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Spinner } from '@/components/ui/spinner'
import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { Link } from 'react-router'
import { toast } from 'sonner'
import { HOA_THEO_MUA_ROUTE_PREFIX } from '../../../../config'
import { platformAccountKeys } from '../../../platform-accounts/query-keys'
import accountService from '../../../platform-accounts/services'
import { importRequestError } from '../error'
import service from '../services'
import { importKeys, type ImportSettings } from '../types'

const platforms = ['zalo', 'facebook', 'instagram'] as const
const names = { zalo: 'Zalo OA', facebook: 'Facebook', instagram: 'Instagram' }

export default function ImportDefaults({
  disabled = false,
  onDirtyChange
}: {
  disabled?: boolean
  onDirtyChange?: (dirty: boolean) => void
}) {
  const { t } = useTenantTranslation()
  const client = useQueryClient()
  const [draft, setDraft] = useState<ImportSettings | null>(null)
  const settings = useQuery({ queryKey: importKeys.defaults, queryFn: service.defaults, throwOnError: false })
  const accounts = useQuery({
    queryKey: platformAccountKeys.list(),
    queryFn: () => accountService.getPlatformAccounts(),
    throwOnError: false
  })
  const current = draft ?? settings.data ?? { accounts: [] }
  const save = useMutation({
    mutationFn: service.saveDefaults,
    onSuccess: (value) => {
      client.setQueryData(importKeys.defaults, value)
      setDraft(null)
      onDirtyChange?.(false)
      toast.success(t('marketingPosts.bulkImport.defaults.saved'))
    },
    onError: (error) => toast.error(importRequestError(error, t))
  })
  const isBusy = disabled || settings.isLoading || accounts.isLoading || save.isPending

  return (
    <details className='rounded-xl border p-3' open={settings.data?.accounts.length === 0 || undefined}>
      <summary className='cursor-pointer text-sm font-medium'>{t('marketingPosts.bulkImport.defaults.title')}</summary>
      <p className='mt-2 text-xs text-muted-foreground'>{t('marketingPosts.bulkImport.defaults.description')}</p>
      {(settings.isError || accounts.isError) && (
        <div className='mt-2 flex items-center gap-2 text-xs text-destructive'>
          {t('marketingPosts.bulkImport.error.loadDefaults')}
          <Button
            size='sm'
            variant='ghost'
            onClick={() => {
              settings.refetch()
              accounts.refetch()
            }}
          >
            {t('marketingPosts.bulkImport.refresh')}
          </Button>
        </div>
      )}
      <div className='mt-3 grid gap-3 sm:grid-cols-3'>
        {platforms.map((platform) => (
          <div key={platform} className='min-w-0 space-y-1.5'>
            <Label htmlFor={`bulk-default-${platform}`}>{names[platform]}</Label>
            <Select
              value={current.accounts.find((x) => x.platform === platform)?.accountId ?? 'none'}
              disabled={isBusy || settings.isError || accounts.isError}
              onValueChange={(value) => {
                setDraft({
                  accounts: [
                    ...current.accounts.filter((x) => x.platform !== platform),
                    ...(value === 'none' ? [] : [{ platform, accountId: value }])
                  ]
                })
                onDirtyChange?.(true)
              }}
            >
              <SelectTrigger id={`bulk-default-${platform}`} className='w-full'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='none'>{t('marketingPosts.bulkImport.defaults.none')}</SelectItem>
                {(accounts.data ?? [])
                  .filter((x) => x.platform === platform)
                  .map((account) => (
                    <SelectItem key={account.id} value={account.id} disabled={account.status !== 'Connected'}>
                      {account.displayName}
                      {account.status === 'Connected'
                        ? ''
                        : ` · ${t('marketingPosts.bulkImport.defaults.unavailable')}`}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
        ))}
      </div>
      <div className='mt-3 flex flex-wrap items-center gap-3'>
        <Button
          type='button'
          size='sm'
          variant='outline'
          disabled={!draft || isBusy}
          onClick={() => save.mutate(current)}
        >
          {save.isPending && <Spinner />}
          {t('marketingPosts.bulkImport.defaults.save')}
        </Button>
        <Link className='text-xs text-primary underline' to={`/${HOA_THEO_MUA_ROUTE_PREFIX}/ai-marketing/accounts`}>
          {t('marketingPosts.bulkImport.defaults.manage')}
        </Link>
      </div>
      {draft && (
        <p className='mt-2 text-xs text-amber-700 dark:text-amber-300'>
          {t('marketingPosts.bulkImport.defaults.unsaved')}
        </p>
      )}
    </details>
  )
}
