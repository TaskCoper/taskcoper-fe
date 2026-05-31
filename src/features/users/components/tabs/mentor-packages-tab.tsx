import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useGetMe } from '@/features/auth/hooks/use-get-me'
import { useGetMentorPackages } from '@/features/mentor-packages/hooks/use-get-mentor-packages'
import { cn, formatCurrency, getFirstParagraphTextFromHtml } from '@/shared/utils'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import type { UserDetail } from '../../types'

interface MentorPackagesTabProps {
  userDetail?: UserDetail | null
}

export default function MentorPackagesTab({ userDetail }: MentorPackagesTabProps) {
  const { t } = useTranslation()
  const { me: user } = useGetMe()

  const isViewingOwnProfile = user?.id === userDetail?.id

  const { mentorPackages, isLoadingMentorPackages } = useGetMentorPackages({
    mentorId: userDetail?.id
  })

  return (
    <div className='grid grid-cols-12 gap-2'>
      {isLoadingMentorPackages
        ? Array.from({ length: 4 }).map((_, index) => (
            <Card key={index} className='shrink-0 col-span-3 rounded-lg p-0 gap-0 shadow-none border'>
              <Skeleton className='w-full h-28 rounded-t-lg rounded-b-none' />
              <div className='p-2 space-y-3'>
                <div className='flex items-center justify-between gap-2'>
                  <Skeleton className='h-4 w-24' />
                  <Skeleton className='h-4 w-12' />
                </div>
                <div className='space-y-1.5'>
                  <Skeleton className='h-3 w-full' />
                  <Skeleton className='h-3 w-2/3' />
                </div>
                <Skeleton className='h-8 w-full mt-1' />
              </div>
            </Card>
          ))
        : mentorPackages.value.items.map((pkg) => (
            <Card key={pkg.id} className={cn('shrink-0 rounded-lg p-0 gap-0 shadow-none col-span-3')}>
              <img
                src={pkg.coverImageUrl ?? undefined}
                alt={pkg.name}
                className='w-full h-28 object-cover rounded-t-lg'
              />

              <div className='flex-1'>
                <div className='px-2 pt-2 pb-1 flex items-center gap-1'>
                  <p className='font-semibold text-primary truncate'>{pkg.name}</p>
                  <div className='flex-1' />
                  <Badge className='rounded-sm' variant='outline'>
                    <p className='font-semibold text-[10.5px]'>
                      {t('mentorPackage.card.sessionsCount', { count: pkg.totalSessions })}
                    </p>
                  </Badge>
                </div>

                <div className='px-2 pb-2'>
                  <p className='text-xs text-muted-foreground line-clamp-3'>
                    {getFirstParagraphTextFromHtml(pkg.description)}
                  </p>
                </div>
              </div>

              <div className='px-2 pb-2'>
                {isViewingOwnProfile ? (
                  <Link to={`/packages/${pkg.id}`}>
                    <Button className='w-full' size='sm'>
                      {t('mentorPackage.card.viewPackage')}
                    </Button>
                  </Link>
                ) : (
                  <Link to={`/packages/${pkg.id}/book`}>
                    <Button className='w-full' size='sm'>
                      {t('mentorPackage.card.bookFor', { price: formatCurrency(pkg.price, pkg.currency) })}
                    </Button>
                  </Link>
                )}
              </div>
            </Card>
          ))}
    </div>
  )
}
