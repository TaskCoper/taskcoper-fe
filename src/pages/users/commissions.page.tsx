import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useGetPublicCommissions } from '@/features/commissions/hooks/use-get-public-commissions'
import type { Commission } from '@/features/commissions/types'
import type { I18nKey } from '@/lib/i18n/types'
import { cn, formatCurrency } from '@/shared/utils'
import { CircleCheckBigIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

export default function CommissionsPage() {
  const { t } = useTranslation()

  const { publicCommissions, isLoadingPublicCommissions } = useGetPublicCommissions()

  const getRankDetail = (titleLevel: string) => {
    const validRanks = ['Bronze', 'Silver', 'Gold', 'Platinum']
    const rankKey = validRanks.includes(titleLevel) ? titleLevel : 'default'
    return {
      description: t(`commissionPage.ranks.${rankKey}.description` as I18nKey) as string,
      subprice: t('commissionPage.revenueShare'),
      cta: t(`commissionPage.ranks.${rankKey}.cta` as 'commissionPage.ranks.Silver.cta', {
        rank: titleLevel
      }) as string,
      featuresTitle: t('commissionPage.featuresTitle')
    }
  }

  const getRateRange = (commissions: Commission[]) => {
    if (!commissions || commissions.length === 0) return '0%'
    const rates = commissions.map((c) => c.rate)
    const min = Math.min(...rates) * 100
    const max = Math.max(...rates) * 100
    if (min === max) return `${min.toFixed(0)}%`
    return `${min.toFixed(0)}% - ${max.toFixed(0)}%`
  }

  return (
    <div className='px-4 pb-4 pt-14 relative'>
      <div className='flex flex-col justify-center items-center gap-4 my-16 max-w-7xl mx-auto text-center'>
        <p className='text-5xl sm:text-6xl font-extrabold'>{t('commissionPage.title')}</p>
        <p className='text-muted-foreground max-w-2xl'>{t('commissionPage.subtitle')}</p>
      </div>

      <div className='relative grid grid-cols-12 gap-4 max-w-7xl mx-auto'>
        {isLoadingPublicCommissions
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className='col-span-12 sm:col-span-6 lg:col-span-3'>
                <Skeleton className='h-96 w-full rounded-xl' />
              </div>
            ))
          : publicCommissions.value.items.map((rank) => {
              const details = getRankDetail(rank.titleLevel)
              const priceRange = getRateRange(rank.commissions)

              return (
                <Card
                  key={rank.titleLevel}
                  className={cn('col-span-12 sm:col-span-6 lg:col-span-3 rounded-xl p-1 gap-0')}
                >
                  <Card
                    className={cn('rounded-lg p-3 gap-0', 'bg-background/30 backdrop-blur-md border border-border/30')}
                  >
                    <div className='space-y-3'>
                      <p className='text-lg font-semibold'>{rank.titleLevel}</p>

                      <div className='space-y-1'>
                        <p className='text-3xl font-bold tracking-tight'>{priceRange}</p>
                        <p className='text-xs text-muted-foreground'>{details.subprice}</p>
                      </div>

                      <p className='text-sm text-foreground/80 leading-relaxed'>{details.description}</p>

                      <Link to='/applications/submit'>
                        <Button className='w-full' size='sm'>
                          {details.cta}
                        </Button>
                      </Link>
                    </div>
                  </Card>

                  <div className='space-y-3 p-4'>
                    <p className='text-sm font-medium'>{details.featuresTitle}</p>

                    <div className='space-y-2'>
                      {rank.commissions.map((c) => (
                        <div key={c.commissionId} className='flex items-start gap-2'>
                          <CircleCheckBigIcon className='size-3 shrink-0 mt-0.5 text-foreground/80' />
                          <div className='text-xs text-foreground/80 leading-relaxed'>
                            <p>
                              {c.minAmount === 0
                                ? t('commissionPage.upTo')
                                : `${formatCurrency(c.minAmount, 'Vnd')} - `}
                              {c.maxAmount ? formatCurrency(c.maxAmount, 'Vnd') : t('commissionPage.unlimited')}
                            </p>
                            <p className='font-semibold text-primary mt-0.5'>
                              {t('commissionPage.earn')}
                              {(c.rate * 100).toFixed(0)}%
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>
              )
            })}
      </div>
    </div>
  )
}
