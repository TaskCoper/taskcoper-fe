import SanitizedHtml from '@/components/sanitized-html'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { useGetMe } from '@/features/auth/hooks/use-get-me'
import { useGetMentorPackages } from '@/features/mentor-packages/hooks/use-get-mentor-packages'
import UpdateMentorDescriptionDialog from '@/features/mentors/components/dialogs/update-mentor-description-dialog'
import BookPackageDialog from '@/features/package-bookings/components/book-package-dialog'
import MentorSchedule from '@/features/schedules/components/mentor-schedule'
import { cn, formatCurrency } from '@/shared/utils'
import type { UserDetail } from '@/types/user.type'
import { BookOpenIcon, ChevronDownIcon, ChevronUpIcon, EditIcon } from 'lucide-react'
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

  const isMentor = userDetail?.role === 'Mentor'
  const isViewingOwnProfile = user?.id === userDetail?.id
  const isHidden = isViewingOwnProfile

  const [isExpanded, setIsExpanded] = useState(false)
  const [needsCollapse, setNeedsCollapse] = useState(false)

  const contentRef = useRef<HTMLDivElement>(null)

  const { mentorPackages } = useGetMentorPackages({ mentorId: userDetail?.id, enabled: isMentor })

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
    <div className='space-y-4 pb-20'>
      {isMentor ? (
        <div className='flex gap-4 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]'>
          {mentorPackages.value.items.map((pkg) => (
            <Card
              key={pkg.id}
              className='shrink-0 w-[calc((100%-8rem)/3)] min-w-[calc((100%-8rem)/3)] rounded-lg p-0 gap-0 shadow-none'
            >
              <div className='px-3 py-2 flex items-center gap-1'>
                <p className='font-semibold text-primary truncate'>{pkg.name}</p>
                <div className='flex-1' />
                <Badge className='rounded-md' variant='secondary'>
                  <p className='font-semibold text-xs'>
                    {t('mentorPackage.card.sessionsCount', { count: pkg.totalSessions })}
                  </p>
                </Badge>
              </div>

              <Separator />

              <div className='p-4'>
                <p className='text-xs text-muted-foreground italic'>{pkg.description}</p>
              </div>

              <div className='px-2 pb-2'>
                {isHidden ? (
                  <Link to={`/packages/${pkg.id}`}>
                    <Button className='w-full'>{t('mentorPackage.card.viewPackage')}</Button>
                  </Link>
                ) : (
                  <BookPackageDialog mentorPackage={pkg}>
                    <Button className='w-full'>
                      {t('mentorPackage.card.bookFor', { price: formatCurrency(pkg.price, pkg.currency) })}
                    </Button>
                  </BookPackageDialog>
                )}
              </div>
            </Card>
          ))}
        </div>
      ) : null}

      {isMentor ? <MentorSchedule userId={userDetail?.id} /> : null}

      <div className='grid grid-cols-12 gap-4'>
        {userDetail?.mentor ? (
          <div className='col-span-12'>
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
