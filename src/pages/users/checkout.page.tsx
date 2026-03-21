import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Spinner } from '@/components/ui/spinner'
import { useGetTransaction } from '@/features/transactions/hooks/use-get-transaction'
import { useGetTransactionStatus } from '@/features/transactions/hooks/use-get-transaction-status'
import { usePaymentCountdown } from '@/hooks/use-payment-countdown'
import { cn, formatCurrency } from '@/shared/utils'
import {
  CheckCircle2Icon,
  CopyIcon,
  ExternalLinkIcon,
  LockKeyholeIcon,
  RefreshCcwIcon,
  ShieldAlertIcon,
  TimerIcon
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate, useSearchParams } from 'react-router'
import { toast } from 'sonner'

const pad2 = (n: number) => String(Math.max(0, Math.floor(n))).padStart(2, '0')

const formatMs = (ms: number) => {
  const totalSeconds = Math.ceil(ms / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${pad2(minutes)}:${pad2(seconds)}`
}

export default function CheckoutPage() {
  const { t } = useTranslation()
  const [searchParams] = useSearchParams()
  const transactionId = searchParams.get('transactionId') ?? undefined
  const navigate = useNavigate()

  const { transaction, isLoadingTransaction } = useGetTransaction({
    transactionId
  })

  const { transactionStatus } = useGetTransactionStatus({
    transactionId
  })

  const [initialTxId, setInitialTxId] = useState<string | null>(null)
  const [isInitiallyPaid, setIsInitiallyPaid] = useState<boolean | null>(null)

  if (transaction && transaction.transactionId !== initialTxId) {
    setInitialTxId(transaction.transactionId)
    setIsInitiallyPaid(!!transaction.paidAt || ['paid', 'completed'].includes(transaction.status?.toLowerCase() || ''))
  }

  const isPaid =
    !!transaction?.paidAt ||
    ['paid', 'completed'].includes(transaction?.status?.toLowerCase() || '') ||
    ['paid', 'completed'].includes(transactionStatus?.status?.toLowerCase() || '')

  useEffect(() => {
    if (isPaid && isInitiallyPaid === false) {
      const timer = setTimeout(() => {
        navigate('/transactions', { replace: true })
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [isPaid, isInitiallyPaid, navigate])

  const { remainingMs, isExpired, progress } = usePaymentCountdown({
    createdOnUtc: transaction?.createdOnUtc,
    isDisabled: isPaid
  })
  const [qrBroken, setQrBroken] = useState(false)

  const handleCopy = async (value: string, label: string) => {
    try {
      await navigator.clipboard.writeText(value)
      toast.success(t('transactions.column.copyId'), { description: label })
    } catch {
      toast.error(t('checkout.error.copyFailed'), { description: t('checkout.error.copyFailedDesc') })
    }
  }

  const qrInfo = useMemo(() => {
    if (!transaction?.qrCodePaymentUrl) return null

    try {
      const url = new URL(transaction.qrCodePaymentUrl)
      return {
        acc: url.searchParams.get('acc'),
        bank: url.searchParams.get('bank'),
        amount: url.searchParams.get('amount'),
        des: url.searchParams.get('des')
      }
    } catch {
      return null
    }
  }, [transaction])

  return (
    <div className='h-screen flex items-center justify-center p-4 bg-dot'>
      <div className='w-full max-w-4xl'>
        {!transactionId ? (
          <div className='rounded-2xl bg-card border shadow-sm p-8 text-center space-y-3 max-w-md mx-auto'>
            <p className='font-semibold'>{t('checkout.error.missingTransaction')}</p>
            <p className='text-sm text-muted-foreground'>{t('checkout.error.missingTransactionDesc')}</p>
            <Button asChild variant='secondary'>
              <Link to='/'>{t('common.button.cancel')}</Link>
            </Button>
          </div>
        ) : isLoadingTransaction ? (
          <div className='rounded-2xl bg-card border shadow-sm p-12 flex items-center justify-center gap-3 max-w-md mx-auto'>
            <Spinner />
            <p className='text-sm text-muted-foreground'>{t('checkout.loading')}</p>
          </div>
        ) : !transaction ? (
          <div className='rounded-2xl bg-card border shadow-sm p-8 text-center space-y-3 max-w-md mx-auto'>
            <p className='font-semibold'>{t('checkout.error.notFound')}</p>
            <p className='text-sm text-muted-foreground'>{t('checkout.error.notFoundDesc')}</p>
            <Button asChild variant='secondary'>
              <Link to='/'>{t('common.button.cancel')}</Link>
            </Button>
          </div>
        ) : (
          <Card className='flex flex-row overflow-hidden p-2'>
            <div className='flex-1 p-4 flex flex-col gap-5'>
              <div>
                <p className='text-lg font-bold'>{transaction.description}</p>
                <p className='text-xs text-muted-foreground mb-1'>{t('checkout.scanToPayDesc')}</p>
              </div>

              <div
                className={cn(
                  'aspect-square overflow-hidden self-center w-full max-w-72',
                  !isPaid && isExpired && 'opacity-40 grayscale'
                )}
              >
                {!transaction.qrCodePaymentUrl || qrBroken ? (
                  <div className='text-center space-y-1'>
                    <p className='text-sm font-medium'>{t('checkout.qrUnavailable')}</p>
                    <p className='text-xs text-muted-foreground'>{t('checkout.qrUnavailableDesc')}</p>
                  </div>
                ) : (
                  <img
                    src={transaction.qrCodePaymentUrl}
                    alt='Payment QR'
                    className='w-full object-contain mix-blend-multiply'
                    onError={() => setQrBroken(true)}
                  />
                )}
              </div>

              {!isPaid && !isExpired && (
                <div className='space-y-1.5'>
                  <div className='flex items-center justify-between text-muted-foreground'>
                    <div className='flex items-center gap-1.5 text-sm'>
                      <TimerIcon className='size-3.5' />
                      {t('checkout.timeLeft')}
                    </div>
                    <p className='font-mono text-sm font-bold text-foreground'>
                      {remainingMs == null ? '--:--' : formatMs(remainingMs)}
                    </p>
                  </div>
                  <Progress value={progress ?? 0} className='h-1' />
                </div>
              )}

              {isPaid && (
                <div className='flex items-start gap-2 text-emerald-600 bg-emerald-50 rounded-lg p-3'>
                  <CheckCircle2Icon className='size-5 shrink-0' />
                  <div>
                    <p className='font-semibold text-sm'>{t('checkout.status.paidDesc')}</p>
                    {isInitiallyPaid === false && (
                      <p className='text-xs text-muted-foreground'>{t('checkout.status.redirecting')}</p>
                    )}
                  </div>
                </div>
              )}

              {!isPaid && isExpired && (
                <div className='flex items-start gap-2 text-destructive bg-destructive/5 rounded-lg p-3'>
                  <ShieldAlertIcon className='size-5 shrink-0' />
                  <div>
                    <p className='font-semibold text-sm'>{t('checkout.error.expired')}</p>
                    <p className='text-xs text-muted-foreground'>{t('checkout.error.expiredDesc')}</p>
                  </div>
                </div>
              )}

              {qrInfo && (
                <div className='rounded-lg space-y-2'>
                  {qrInfo.bank && (
                    <div className='flex items-center justify-between'>
                      <p className='text-sm text-muted-foreground'>{t('checkout.qrBank')}</p>
                      <p className='text-sm font-semibold'>{qrInfo.bank}</p>
                    </div>
                  )}

                  {qrInfo.acc && (
                    <div className='flex items-center justify-between'>
                      <p className='text-sm text-muted-foreground'>{t('checkout.qrAccount')}</p>
                      <p className='text-sm font-semibold'>{qrInfo.acc}</p>
                    </div>
                  )}
                  {qrInfo.des && (
                    <div className='flex items-center justify-between'>
                      <p className='text-sm text-muted-foreground'>{t('checkout.transferContent')}</p>
                      <p className='text-sm font-semibold'>{qrInfo.des}</p>
                    </div>
                  )}
                </div>
              )}

              {transaction.identifyDescription && !qrInfo && (
                <div className='rounded-xl border px-4 py-3 space-y-1'>
                  <div className='flex items-center justify-between'>
                    <p className='text-sm text-muted-foreground'>{t('checkout.transferContent')}</p>
                    <Button
                      size='sm'
                      variant='ghost'
                      className='h-6 gap-1 text-xs text-muted-foreground'
                      onClick={() => handleCopy(transaction.identifyDescription!, t('checkout.transferContent'))}
                    >
                      <CopyIcon className='size-3' />
                      {t('transactions.column.copyId')}
                    </Button>
                  </div>
                  <p className='font-mono text-sm break-all font-semibold'>{transaction.identifyDescription}</p>
                </div>
              )}

              <div className='flex gap-2 mt-auto'>
                <Button
                  variant='outline'
                  size='sm'
                  className='flex-1 gap-1.5'
                  onClick={() => window.location.reload()}
                  disabled={isPaid}
                >
                  <RefreshCcwIcon className='size-3.5' />
                  {t('checkout.refresh')}
                </Button>
                <Button asChild variant='outline' size='sm' className='flex-1 gap-1.5'>
                  <a href={transaction.qrCodePaymentUrl} target='_blank' rel='noreferrer'>
                    <ExternalLinkIcon className='size-3.5' />
                    {t('checkout.openPaymentLink')}
                  </a>
                </Button>
              </div>
            </div>

            <div className='w-80 shrink-0 bg-blue-100/40 p-8 flex flex-col justify-center items-center gap-6 rounded-lg'>
              <div className='text-center space-y-4'>
                <p className='text-xs text-muted-foreground font-medium'>{t('checkout.amountLabel')}</p>
                <p className='text-5xl font-bold text-primary'>
                  {formatCurrency(transaction.amount, transaction.currency)}
                </p>
                <div className='flex items-center justify-center gap-1.5'>
                  <LockKeyholeIcon className='size-3 text-emerald-600' />
                  <p className='text-xs text-emerald-600 font-medium'>{t('checkout.securePayment')}</p>
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}
