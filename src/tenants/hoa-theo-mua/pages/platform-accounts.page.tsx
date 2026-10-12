import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Spinner } from '@/components/ui/spinner'
import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { InfoIcon, PlugZapIcon } from 'lucide-react'
import PlatformAccountsTable from '../features/platform-accounts/components/platform-accounts-table'
import { usePlatformAccounts } from '../features/platform-accounts/hooks/use-platform-accounts'
import { connectablePlatforms } from '../features/platform-accounts/types'

export default function PlatformAccountsPage() {
  const { t } = useTenantTranslation()
  const { accounts, isGettingAccounts, isBusy, connectAccount, reconnectAccount, refreshAccount, disconnectAccount } =
    usePlatformAccounts()

  return (
    <div className='h-full overflow-auto'>
      <div className='space-y-6 p-6'>
        <div>
          <h1 className='text-2xl font-bold'>{t('platformAccounts.title')}</h1>
          <p className='text-sm text-muted-foreground'>{t('platformAccounts.description')}</p>
        </div>

        {/* Kết nối xong chưa chắc đã đăng được - doc backend nhắc hai lần nên nói trước cho rõ */}
        <p className='flex items-start gap-2 rounded-xl border border-dashed p-3 text-xs text-muted-foreground'>
          <InfoIcon className='mt-0.5 size-3.5 shrink-0' />
          {t('platformAccounts.connectedNotReadyNote')}
        </p>

        <div className='overflow-hidden rounded-xl border bg-card shadow-sm'>
          {/* Mỗi nền tảng một nút riêng: backend mở phiên OAuth theo từng nền tảng */}
          <div className='flex flex-wrap items-center justify-end gap-2 border-b bg-muted/20 p-3'>
            {connectablePlatforms.map((platform) => (
              <Button
                key={platform}
                type='button'
                size='sm'
                variant='outline'
                disabled={isBusy}
                onClick={() => connectAccount(platform)}
              >
                {isBusy ? <Spinner /> : <PlugZapIcon />}
                {t('platformAccounts.action.connectPlatform', { platform: t(`marketingPosts.platform.${platform}`) })}
              </Button>
            ))}
          </div>

          {isGettingAccounts ? (
            <div className='space-y-2 p-4'>
              <Skeleton className='h-10 w-full' />
              <Skeleton className='h-10 w-full' />
            </div>
          ) : (
            <PlatformAccountsTable
              accounts={accounts}
              isBusy={isBusy}
              onReconnect={reconnectAccount}
              onRefresh={refreshAccount}
              onDisconnect={disconnectAccount}
            />
          )}
        </div>

        <p className='text-xs text-muted-foreground'>{t('platformAccounts.zaloNote')}</p>
      </div>
    </div>
  )
}
