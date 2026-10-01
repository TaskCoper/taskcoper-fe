import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { formatDateTime } from '@/lib/date'
import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { useConfirmStore } from '@/lib/zustand/confirm.store'
import { cn } from '@/shared/utils'
import { KeyRoundIcon, LinkIcon, MoreHorizontalIcon, RefreshCwIcon, UnlinkIcon } from 'lucide-react'
import { PlatformAccountStatus, type PlatformAccount } from '../types'

const statusBadgeClasses: Record<PlatformAccountStatus, string> = {
  [PlatformAccountStatus.Connected]:
    'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300',
  [PlatformAccountStatus.ReauthRequired]:
    'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-300',
  [PlatformAccountStatus.Disabled]:
    'border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-800 dark:bg-slate-900/40 dark:text-slate-300'
}

const PlatformAccountsTable = ({
  accounts,
  isBusy,
  onReconnect,
  onRefresh,
  onDisconnect
}: {
  accounts: PlatformAccount[]
  isBusy: boolean
  onReconnect: (id: string) => void
  onRefresh: (id: string) => void
  onDisconnect: (id: string) => void
}) => {
  const { t } = useTenantTranslation()
  const { confirm } = useConfirmStore()

  const askDisconnect = async (account: PlatformAccount) => {
    const isConfirmed = await confirm({
      title: t('platformAccounts.disconnect.title'),
      description: t('platformAccounts.disconnect.description', { name: account.displayName }),
      confirmText: t('platformAccounts.disconnect.confirmText'),
      cancelText: t('common.button.cancel'),
      variant: 'destructive'
    })

    if (isConfirmed) onDisconnect(account.id)
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{t('platformAccounts.column.platform')}</TableHead>
          <TableHead>{t('platformAccounts.column.account')}</TableHead>
          <TableHead>{t('platformAccounts.column.status')}</TableHead>
          <TableHead>{t('platformAccounts.field.lastValidatedAt')}</TableHead>
          <TableHead>{t('platformAccounts.field.accessTokenExpiresAt')}</TableHead>
          <TableHead className='text-right'>{t('platformAccounts.column.actions')}</TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {accounts.length === 0 ? (
          <TableRow className='hover:bg-transparent'>
            <TableCell colSpan={6} className='h-24 text-center text-sm text-muted-foreground'>
              {t('platformAccounts.empty')}
            </TableCell>
          </TableRow>
        ) : (
          accounts.map((account) => (
            <TableRow key={account.id}>
              <TableCell className='whitespace-nowrap'>{t(`marketingPosts.platform.${account.platform}`)}</TableCell>

              <TableCell>
                <div className='flex items-center gap-1.5'>
                  <span className='truncate font-medium'>{account.displayName}</span>
                  {/* Quyền được cấp dài dòng, nhét thẳng vào bảng thì vỡ - giấu vào tooltip */}
                  {account.grantedScopes.length > 0 && (
                    <Tooltip>
                      <TooltipTrigger className='flex cursor-help items-center'>
                        <KeyRoundIcon className='size-3 text-muted-foreground' />
                        <span className='sr-only'>{t('platformAccounts.column.scopes')}</span>
                      </TooltipTrigger>
                      <TooltipContent className='max-w-64'>{account.grantedScopes.join(', ')}</TooltipContent>
                    </Tooltip>
                  )}
                </div>
                <p className='truncate font-mono text-xs text-muted-foreground'>
                  {account.pageId ?? account.externalAccountId}
                </p>
              </TableCell>

              <TableCell>
                <Badge variant='outline' className={cn('font-normal', statusBadgeClasses[account.status])}>
                  {t(`platformAccounts.status.${account.status}`)}
                </Badge>
                {account.lastErrorCode && (
                  <p className='mt-1 font-mono text-[0.65rem] text-amber-700 dark:text-amber-400'>
                    {account.lastErrorCode}
                  </p>
                )}
              </TableCell>

              <TableCell className='whitespace-nowrap text-sm tabular-nums'>
                {account.lastValidatedAt ? formatDateTime(account.lastValidatedAt, 'dateTimeShort') : '-'}
              </TableCell>

              <TableCell className='whitespace-nowrap text-sm tabular-nums'>
                {account.accessTokenExpiresAt
                  ? formatDateTime(account.accessTokenExpiresAt, 'dateTimeShort')
                  : t('platformAccounts.field.noExpiry')}
              </TableCell>

              <TableCell>
                <div className='flex justify-end'>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant='ghost' className='size-8 p-0' disabled={isBusy}>
                        <span className='sr-only'>{t('platformAccounts.column.actions')}</span>
                        <MoreHorizontalIcon className='size-4' />
                      </Button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent align='end'>
                      <DropdownMenuLabel>{t('platformAccounts.column.actions')}</DropdownMenuLabel>

                      {/* Kiểm tra token là thao tác tay - backend chưa có tác vụ tự làm mới định kỳ */}
                      <DropdownMenuItem onClick={() => onRefresh(account.id)}>
                        <RefreshCwIcon />
                        {t('platformAccounts.action.refresh')}
                      </DropdownMenuItem>

                      <DropdownMenuItem onClick={() => onReconnect(account.id)}>
                        <LinkIcon />
                        {t('platformAccounts.action.reconnect')}
                      </DropdownMenuItem>

                      {account.status === PlatformAccountStatus.Connected && (
                        <DropdownMenuItem variant='destructive' onClick={() => askDisconnect(account)}>
                          <UnlinkIcon />
                          {t('platformAccounts.action.disconnect')}
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  )
}

export default PlatformAccountsTable
