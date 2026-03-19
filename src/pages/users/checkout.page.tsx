import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Spinner } from '@/components/ui/spinner'
import { useGetTransaction } from '@/features/transactions/hooks/use-get-transaction'
import { cn, formatCurrency } from '@/shared/utils'
import { CheckCircle2Icon, CopyIcon, ExternalLinkIcon, RefreshCcwIcon, ShieldAlertIcon, TimerIcon } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useSearchParams } from 'react-router'
import { toast } from 'sonner'
import logo from '/images/taskcoper.png'

const PAYMENT_WINDOW_MS = 2 * 60 * 1000

const pad2 = (n: number) => String(Math.max(0, Math.floor(n))).padStart(2, '0')

const formatMs = (ms: number) => {
  const totalSeconds = Math.ceil(ms / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${pad2(minutes)}:${pad2(seconds)}`
}

function usePaymentCountdown(createdOnUtc?: string | null, isDisabled?: boolean) {
  const createdAtMs = useMemo(() => {
    if (!createdOnUtc) return null
    const parsed = Date.parse(createdOnUtc)
    return Number.isFinite(parsed) ? parsed : null
  }, [createdOnUtc])

  const expiresAtMs = useMemo(() => (createdAtMs == null ? null : createdAtMs + PAYMENT_WINDOW_MS), [createdAtMs])

  const [nowMs, setNowMs] = useState(() => Date.now())

  useEffect(() => {
    if (expiresAtMs == null || isDisabled) return
    const id = window.setInterval(() => setNowMs(Date.now()), 250)
    return () => window.clearInterval(id)
  }, [expiresAtMs, isDisabled])

  const remainingMs = expiresAtMs == null ? null : Math.max(0, expiresAtMs - nowMs)
  const isExpired = remainingMs != null && remainingMs <= 0

  const progress = useMemo(() => {
    if (remainingMs == null) return null
    const elapsed = PAYMENT_WINDOW_MS - remainingMs
    return Math.max(0, Math.min(100, (elapsed / PAYMENT_WINDOW_MS) * 100))
  }, [remainingMs])

  return {
    createdAtMs,
    expiresAtMs,
    remainingMs,
    isExpired,
    progress
  }
}

export default function CheckoutPage() {
  const { t } = useTranslation()
  const [searchParams] = useSearchParams()
  const transactionId = searchParams.get('transactionId') ?? undefined

  const { transaction, isLoadingTransaction } = useGetTransaction({
    transactionId,
    refetchInterval: (query) => {
      const data = query.state.data
      if (!data) return false
      if (data.paidAt) return false
      return 4000
    }
  })

  const isPaid = !!transaction?.paidAt || transaction?.status?.toLowerCase() === 'paid'
  const { remainingMs, isExpired, progress } = usePaymentCountdown(transaction?.createdOnUtc, isPaid)

  const [qrBroken, setQrBroken] = useState(false)

  const status = useMemo(() => {
    if (isPaid) return { label: t('checkout.status.paid'), tone: 'success' as const }
    if (isExpired) return { label: t('checkout.status.expired'), tone: 'destructive' as const }
    return { label: t('checkout.status.pending'), tone: 'secondary' as const }
  }, [isExpired, isPaid, t])

  const handleCopy = async (value: string, label: string) => {
    try {
      await navigator.clipboard.writeText(value)
      toast.success(t('transactions.column.copyId'), { description: label })
    } catch {
      toast.error(t('checkout.error.copyFailed'), { description: t('checkout.error.copyFailedDesc') })
    }
  }

  return (
    <div className='min-h-dvh bg-dot from-background via-background to-muted/30'>
      <div className='mx-auto w-full max-w-5xl px-4 py-8 md:px-8 md:py-12'>
        <div className='flex flex-col gap-6'>
          <div className='flex items-start justify-between gap-4'>
            <div className='min-w-0'>
              <div className='flex items-center gap-3'>
                <Link to='/' className='shrink-0'>
                  <img src={logo} alt='TaskCoper' className='h-7' />
                </Link>
                <p className='font-mono text-xs tracking-wide text-muted-foreground'>{t('checkout.breadcrumb')}</p>
              </div>
              <h1 className='mt-3 text-2xl font-extrabold tracking-tight md:text-3xl'>{t('checkout.title')}</h1>
              <p className='mt-1 text-sm text-muted-foreground'>{t('checkout.description')}</p>
            </div>

            <Badge
              variant={
                status.tone === 'destructive' ? 'destructive' : status.tone === 'success' ? 'default' : 'secondary'
              }
              className={cn(
                'shrink-0 rounded-full px-3 py-1 text-xs font-semibold',
                status.tone === 'success' && 'bg-emerald-600 hover:bg-emerald-600 text-white'
              )}
            >
              {status.label}
            </Badge>
          </div>

          {!transactionId ? (
            <Card>
              <CardHeader>
                <CardTitle>{t('checkout.error.missingTransaction')}</CardTitle>
                <CardDescription>{t('checkout.error.missingTransactionDesc')}</CardDescription>
              </CardHeader>
              <CardFooter className='justify-end'>
                <Button asChild>
                  <Link to='/'>{t('common.button.cancel')}</Link>
                </Button>
              </CardFooter>
            </Card>
          ) : isLoadingTransaction ? (
            <Card>
              <CardContent className='py-10 flex items-center justify-center gap-3'>
                <Spinner />
                <p className='text-sm text-muted-foreground'>{t('checkout.loading')}</p>
              </CardContent>
            </Card>
          ) : !transaction ? (
            <Card>
              <CardHeader>
                <CardTitle>{t('checkout.error.notFound')}</CardTitle>
                <CardDescription>{t('checkout.error.notFoundDesc')}</CardDescription>
              </CardHeader>
              <CardFooter className='justify-end'>
                <Button asChild variant='secondary'>
                  <Link to='/'>{t('common.button.cancel')}</Link>
                </Button>
              </CardFooter>
            </Card>
          ) : (
            <div className='grid grid-cols-1 gap-6 lg:grid-cols-5'>
              <Card className='lg:col-span-3'>
                <CardHeader className='border-b'>
                  <div className='flex items-start justify-between gap-4'>
                    <div className='min-w-0'>
                      <CardTitle className='truncate'>
                        {transaction.description || t('checkout.defaultDescription')}
                      </CardTitle>
                      <CardDescription className='mt-1'>
                        {t('checkout.transactionLabel')} <span className='font-mono'>{transaction.transactionId}</span>
                      </CardDescription>
                    </div>

                    <div className='text-right'>
                      <p className='font-mono text-xs text-muted-foreground'>{t('checkout.amountLabel')}</p>
                      <p className='mt-1 text-xl font-extrabold text-primary'>
                        {formatCurrency(transaction.amount, transaction.currency)}
                      </p>
                    </div>
                  </div>

                  <div className='mt-4'>
                    {isPaid ? (
                      <div className='flex items-center gap-2 text-emerald-700'>
                        <CheckCircle2Icon className='size-4' />
                        <p className='text-sm font-semibold'>{t('checkout.status.paidDesc')}</p>
                      </div>
                    ) : isExpired ? (
                      <div className='flex items-start gap-2 text-destructive'>
                        <ShieldAlertIcon className='mt-0.5 size-4' />
                        <div>
                          <p className='text-sm font-semibold'>{t('checkout.error.expired')}</p>
                          <p className='text-xs text-muted-foreground mt-0.5'>{t('checkout.error.expiredDesc')}</p>
                        </div>
                      </div>
                    ) : (
                      <div className='space-y-2'>
                        <div className='flex items-center justify-between gap-3'>
                          <div className='flex items-center gap-2 text-muted-foreground'>
                            <TimerIcon className='size-4' />
                            <p className='text-sm'>{t('checkout.timeLeft')}</p>
                          </div>
                          <p className='font-mono text-sm font-semibold'>
                            {remainingMs == null ? '--:--' : formatMs(remainingMs)}
                          </p>
                        </div>
                        <Progress value={progress ?? 0} className='h-2' />
                      </div>
                    )}
                  </div>
                </CardHeader>

                <CardContent className='space-y-5'>
                  <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
                    <div className='rounded-lg border bg-muted/30 p-4'>
                      <p className='text-xs font-mono text-muted-foreground'>{t('checkout.gatewayLabel')}</p>
                      <p className='mt-1 text-sm font-semibold'>{transaction.gatewayName || '—'}</p>
                    </div>
                    <div className='rounded-lg border bg-muted/30 p-4'>
                      <p className='text-xs font-mono text-muted-foreground'>{t('checkout.statusLabel')}</p>
                      <p className='mt-1 text-sm font-semibold'>{transaction.status || '—'}</p>
                    </div>
                  </div>

                  <div className='space-y-2'>
                    <div className='flex items-center justify-between gap-3'>
                      <p className='text-sm font-semibold'>{t('checkout.transferContent')}</p>
                      <Button
                        size='sm'
                        variant='secondary'
                        onClick={() => handleCopy(transaction.identifyDescription || '', t('checkout.transferContent'))}
                        disabled={!transaction.identifyDescription}
                        className='gap-2'
                      >
                        <CopyIcon className='size-4' />
                        {t('transactions.column.copyId')}
                      </Button>
                    </div>
                    <div className='rounded-lg border bg-background p-4'>
                      <p className='font-mono text-sm break-all'>{transaction.identifyDescription || '—'}</p>
                      <p className='mt-2 text-xs text-muted-foreground'>{t('checkout.transferContentDesc')}</p>
                    </div>
                  </div>

                  <Separator />

                  <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
                    <div className='min-w-0'>
                      <p className='text-sm font-semibold'>{t('checkout.troubleTitle')}</p>
                      <p className='text-xs text-muted-foreground'>{t('checkout.troubleDesc')}</p>
                    </div>
                    <Button asChild variant='outline' className='gap-2'>
                      <a href={transaction.qrCodePaymentUrl} target='_blank' rel='noreferrer'>
                        <ExternalLinkIcon className='size-4' />
                        {t('checkout.openPaymentLink')}
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className='lg:col-span-2'>
                <CardHeader className='border-b'>
                  <CardTitle>{t('checkout.scanToPay')}</CardTitle>
                  <CardDescription>{t('checkout.scanToPayDesc')}</CardDescription>
                </CardHeader>

                <CardContent className='space-y-4'>
                  <div
                    className={cn(
                      'rounded-xl border bg-muted/20 p-4 flex items-center justify-center aspect-square overflow-hidden',
                      isExpired && 'opacity-60'
                    )}
                  >
                    {!transaction.qrCodePaymentUrl || qrBroken ? (
                      <div className='text-center space-y-2'>
                        <p className='text-sm font-semibold'>{t('checkout.qrUnavailable')}</p>
                        <p className='text-xs text-muted-foreground'>{t('checkout.qrUnavailableDesc')}</p>
                      </div>
                    ) : (
                      <img
                        src={transaction.qrCodePaymentUrl}
                        alt='Payment QR'
                        className='h-full w-full object-contain'
                        onError={() => setQrBroken(true)}
                      />
                    )}
                  </div>

                  <div className='flex gap-2'>
                    <Button
                      className='flex-1 gap-2'
                      variant='secondary'
                      onClick={() => window.location.reload()}
                      disabled={isPaid}
                    >
                      <RefreshCcwIcon className='size-4' />
                      {t('checkout.refresh')}
                    </Button>
                    <Button
                      className='flex-1 gap-2'
                      onClick={() => handleCopy(transaction.transactionId, t('checkout.transactionLabel'))}
                      variant='outline'
                    >
                      <CopyIcon className='size-4' />
                      {t('checkout.copyId')}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
