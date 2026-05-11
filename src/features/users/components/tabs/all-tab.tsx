import SanitizedHtml from '@/components/sanitized-html'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { useGetMe } from '@/features/auth/hooks/use-get-me'
import { useGetMentorPackages } from '@/features/mentor-packages/hooks/use-get-mentor-packages'
import UpdateMentorDescriptionDialog from '@/features/mentors/components/dialogs/update-mentor-description-dialog'
import BookPackageDialog from '@/features/package-bookings/components/book-package-dialog'
import type { UserDetail } from '@/features/users/types'
import { cn, formatCurrency } from '@/shared/utils'
import { BookOpenIcon, ChevronDownIcon, ChevronUpIcon, EditIcon, GraduationCapIcon } from 'lucide-react'
import { useCallback, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

const COLLAPSED_HEIGHT = 300

interface AllTabProps {
  userDetail?: UserDetail | null
}

export default function AllTab({ userDetail }: AllTabProps) {
  const { t } = useTranslation()
  const { me: user } = useGetMe()

  const { mentorPackages, isLoadingMentorPackages } = useGetMentorPackages({
    mentorId: userDetail?.id,
    enabled: userDetail?.role === 'Mentor'
  })

  const isViewingOwnProfile = user?.id === userDetail?.id

  const [isExpanded, setIsExpanded] = useState(false)
  const [needsCollapse, setNeedsCollapse] = useState(false)

  const contentRef = useRef<HTMLDivElement>(null)

  const measureRef = useCallback((node: HTMLDivElement | null) => {
    if (node) {
      const observer = new ResizeObserver(() => {
        setNeedsCollapse(node.scrollHeight > COLLAPSED_HEIGHT)
      })
      observer.observe(node)
      return () => observer.disconnect()
    }
  }, [])

  return (
    <div className='pb-20 grid grid-cols-12 gap-4'>
      <div className='col-span-3 space-y-12'>
        {(userDetail?.domains.length ?? 0) > 0 ? (
          <div className='space-y-2'>
            <div className='flex items-center gap-2'>
              <GraduationCapIcon className='size-5 text-primary' />
              <p className='font-medium'>Domain</p>
            </div>
            <div className='flex items-center flex-wrap gap-1'>
              {userDetail?.domains.map((domain) => (
                <Badge key={domain.id} className='rounded-sm'>
                  {domain.name}
                </Badge>
              ))}
            </div>
          </div>
        ) : null}
      </div>

      <div className='col-span-9 space-y-4'>
        <div
          className={cn(
            'gap-4',
            mentorPackages.value.items.length > 3
              ? 'flex overflow-x-auto pb-1 snap-x scrollbar-none'
              : 'grid grid-cols-12'
          )}
        >
          {isLoadingMentorPackages
            ? Array.from({ length: 3 }).map((_, index) => (
                <Card
                  key={index}
                  className={cn(
                    'shrink-0 rounded-lg p-0 gap-0 shadow-none border',
                    mentorPackages.value.items.length > 3 ? 'w-70 lg:w-[31%] snap-start' : 'col-span-4'
                  )}
                >
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
            : mentorPackages.value.totalCount === 0
              ? null
              : mentorPackages.value.items
                  .sort((a, b) => new Date(a.pinOnUtc ?? '').getTime() - new Date(b.pinOnUtc ?? '').getTime())
                  .map((pkg) => (
                    <Card
                      key={pkg.id}
                      className={cn(
                        'shrink-0 rounded-lg p-0 gap-0 shadow-none',
                        mentorPackages.value.items.length > 3 ? 'w-70 lg:w-[30%] snap-start' : 'col-span-4'
                      )}
                    >
                      <img
                        src={pkg.coverImageUrl ?? undefined}
                        alt={pkg.name}
                        className='w-full h-28 object-cover rounded-t-lg'
                      />

                      <div className='px-2 pt-2 pb-1 flex items-center gap-1'>
                        <p className='font-semibold text-primary truncate'>{pkg.name}</p>
                        <div className='flex-1' />
                        <Badge className='rounded-sm' variant='secondary'>
                          <p className='font-semibold text-[10.5px]'>
                            {t('mentorPackage.card.sessionsCount', { count: pkg.totalSessions })}
                          </p>
                        </Badge>
                      </div>

                      <div className='px-2 pb-2'>
                        <p className='text-xs text-muted-foreground line-clamp-2'>{pkg.description}</p>
                      </div>

                      <div className='px-2 pb-2'>
                        {isViewingOwnProfile ? (
                          <Link to={`/packages/${pkg.id}`}>
                            <Button className='w-full' size='sm'>
                              {t('mentorPackage.card.viewPackage')}
                            </Button>
                          </Link>
                        ) : (
                          <BookPackageDialog mentorPackage={pkg}>
                            <Button className='w-full' size='sm'>
                              {t('mentorPackage.card.bookFor', { price: formatCurrency(pkg.price, pkg.currency) })}
                            </Button>
                          </BookPackageDialog>
                        )}
                      </div>
                    </Card>
                  ))}
        </div>

        {userDetail?.mentor ? (
          <div>
            <Card className='w-full text-sm sm:text-base text-left p-0 shadow-none gap-0 overflow-hidden rounded-lg'>
              <div className='pl-3 pr-2 py-2 flex items-center justify-between gap-2 bg-muted/60 rounded-t-xl'>
                <div className='flex items-center gap-2'>
                  <BookOpenIcon className='size-4 text-muted-foreground' />
                  <p className='text-sm font-semibold text-muted-foreground'>{t('project.info.readme')}</p>
                </div>

                {isViewingOwnProfile && userDetail ? (
                  <UpdateMentorDescriptionDialog user={userDetail}>
                    <Button variant='outline' size='icon-sm'>
                      <EditIcon />
                    </Button>
                  </UpdateMentorDescriptionDialog>
                ) : null}
              </div>
              <Separator />

              <div className='relative'>
                <div
                  ref={(node) => {
                    contentRef.current = node
                    measureRef(node)
                  }}
                  className={cn('p-4 overflow-hidden transition-all', !isExpanded && 'max-h-96')}
                >
                  <SanitizedHtml html={userDetail?.mentor?.description} />
                </div>
                {/* Gradient overlay when collapsed - only covers the HTML area */}
                {needsCollapse && !isExpanded && (
                  <div className='absolute bottom-0 left-0 right-0 h-12 bg-linear-to-t from-background to-transparent pointer-events-none' />
                )}
              </div>

              {needsCollapse && (
                <div className='px-4 pb-4'>
                  <Button variant='secondary' className='w-full' onClick={() => setIsExpanded(!isExpanded)}>
                    {isExpanded ? (
                      <>
                        <ChevronUpIcon />
                        {t('common.ui.viewLess')}
                      </>
                    ) : (
                      <>
                        <ChevronDownIcon />
                        {t('common.ui.viewMore')}
                      </>
                    )}
                  </Button>
                </div>
              )}
            </Card>
          </div>
        ) : null}
      </div>
    </div>
  )
}
