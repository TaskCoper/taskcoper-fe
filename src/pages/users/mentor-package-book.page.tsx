import RatingField, { type RatingValue } from '@/components/rating-field'
import SanitizedHtml from '@/components/sanitized-html'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useGetMe } from '@/features/auth/hooks/use-get-me'
import { useGetFeedbacks } from '@/features/feedbacks/hooks/use-get-feedbacks'
import PackageFeedbacksDialog from '@/features/mentor-packages/components/package-feedbacks-dialog'
import { useGetMentorPackage } from '@/features/mentor-packages/hooks/use-get-mentor-package'
import BookPackageDialog from '@/features/package-bookings/components/book-package-dialog'
import { cn, formatCurrency, formatDate, getAvatarFallback, getFirstParagraphTextFromHtml } from '@/shared/utils'
import { formatDistanceToNow } from 'date-fns'
import {
  CalendarDaysIcon,
  CheckCheckIcon,
  GlobeIcon,
  HeartIcon,
  LinkIcon,
  LockKeyholeIcon,
  SettingsIcon,
  Share2Icon,
  StarIcon,
  UsersRoundIcon
} from 'lucide-react'
import { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useParams } from 'react-router'
import placholderCoverImage from '/images/placeholder-cover.png'

const gridGapClass = 'gap-10'

const MentorPackageBookSkeleton = () => (
  <div className='relative pb-8 h-full overflow-y-auto'>
    <div className='relative'>
      <div className='bg-primary/95 relative overflow-visible'>
        <div className={`mx-auto max-w-6xl grid grid-cols-3 ${gridGapClass}`}>
          <div className='col-span-2 relative'>
            <div className='px-6 pt-6 pb-16 space-y-6'>
              <div className='flex items-center gap-2'>
                <Skeleton className='h-4 w-28 bg-background/20' />
                <Skeleton className='h-4 w-2 bg-background/20' />
                <Skeleton className='h-4 w-44 bg-background/20' />
              </div>
              <Skeleton className='h-10 w-3/4 bg-background/20' />
              <Skeleton className='h-4 w-full bg-background/20' />
              <Skeleton className='h-4 w-11/12 bg-background/20' />
              <div className='flex items-center gap-6'>
                <Skeleton className='h-4 w-44 bg-background/20' />
                <Skeleton className='h-4 w-28 bg-background/20' />
              </div>
            </div>

            <Card className='absolute left-1/2 bottom-0 -translate-x-1/2 translate-y-1/2 w-full rounded-lg py-3 px-6 flex-row justify-between items-center'>
              <div className='flex items-center gap-4'>
                <Skeleton className='size-10 rounded-full' />
                <div className='space-y-2'>
                  <Skeleton className='h-4 w-36' />
                  <Skeleton className='h-3 w-44' />
                </div>
              </div>
              <Skeleton className='h-14 w-px' />
              <div className='space-y-2 flex flex-col items-center'>
                <Skeleton className='h-6 w-12' />
                <Skeleton className='h-3 w-20' />
                <Skeleton className='h-3 w-24' />
              </div>
              <Skeleton className='h-10 w-px' />
              <div className='space-y-2 flex flex-col items-center'>
                <Skeleton className='h-4 w-4' />
                <Skeleton className='h-6 w-10' />
                <Skeleton className='h-3 w-16' />
              </div>
            </Card>
          </div>
        </div>
      </div>

      <div className='absolute inset-y-0 inset-x-0 pointer-events-none z-20'>
        <div className={`mx-auto h-full max-w-6xl grid grid-cols-3 grid-rows-[1fr] ${gridGapClass}`}>
          <div className='col-span-2' />
          <div className='col-span-1 pt-6'>
            <div className='sticky top-6 pointer-events-auto'>
              <Card className='rounded-xl p-1 gap-2 shadow-xl'>
                <Skeleton className='w-full h-40 rounded-md' />
                <div className='p-4'>
                  <Skeleton className='h-9 w-40' />
                </div>
                <div className='space-y-3 px-2 pb-2'>
                  <Skeleton className='h-4 w-full' />
                  <Skeleton className='h-4 w-full' />
                  <Skeleton className='h-4 w-full' />
                  <Skeleton className='h-14 w-full rounded-md' />
                  <Skeleton className='h-10 w-full rounded-md' />
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <div className={`mx-auto max-w-6xl grid grid-cols-3 items-start ${gridGapClass}`}>
        <div className='col-span-2 pt-18 space-y-14'>
          <div className='space-y-3'>
            <Skeleton className='h-7 w-52' />
            <Skeleton className='h-4 w-full' />
            <Skeleton className='h-4 w-11/12' />
            <Skeleton className='h-4 w-10/12' />
          </div>

          <div className='space-y-3'>
            <Skeleton className='h-7 w-48' />
            <Skeleton className='h-14 w-full rounded-md' />
            <Skeleton className='h-14 w-full rounded-md' />
          </div>

          <div className='space-y-4'>
            <Skeleton className='h-7 w-72' />
            <div className='grid grid-cols-2 gap-x-8 gap-y-6'>
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className='border-t py-4 space-y-3'>
                  <div className='flex items-center gap-2'>
                    <Skeleton className='size-9 rounded-full' />
                    <div className='space-y-2'>
                      <Skeleton className='h-4 w-32' />
                      <Skeleton className='h-3 w-24' />
                    </div>
                  </div>
                  <Skeleton className='h-3 w-full' />
                  <Skeleton className='h-3 w-11/12' />
                </div>
              ))}
            </div>
            <Skeleton className='h-10 w-full rounded-md' />
          </div>
        </div>
      </div>
    </div>
  </div>
)

export default function MentorPackageBookPage() {
  const { t } = useTranslation()
  const { me } = useGetMe()
  const { packageId } = useParams<{ packageId: string }>()

  const [isLinkCopied, setIsLinkCopied] = useState(false)
  const [isShareCopied, setIsShareCopied] = useState(false)

  const { mentorPackage, isLoadingMentorPackage } = useGetMentorPackage({
    packageId
  })

  const { feedbacks, isLoadingFeedbacks } = useGetFeedbacks({
    targetType: 'MentorPackage',
    targetId: packageId,
    pageSize: 4
  })

  const meSlug = me?.slug
  const isCreator = mentorPackage?.creator.userId === me?.id

  const showCopiedIndicator = useCallback((type: 'link' | 'share') => {
    if (type === 'link') {
      setIsLinkCopied(true)
      window.setTimeout(() => setIsLinkCopied(false), 1000)
      return
    }

    setIsShareCopied(true)
    window.setTimeout(() => setIsShareCopied(false), 1000)
  }, [])

  const copyToClipboard = useCallback(async (value: string) => {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(value)
      return
    }

    const textArea = document.createElement('textarea')
    textArea.value = value
    textArea.style.position = 'fixed'
    textArea.style.opacity = '0'
    document.body.appendChild(textArea)
    textArea.focus()
    textArea.select()
    document.execCommand('copy')
    document.body.removeChild(textArea)
  }, [])

  const handleCopyCurrentUrl = useCallback(async () => {
    await copyToClipboard(window.location.href)
    showCopiedIndicator('link')
  }, [copyToClipboard, showCopiedIndicator])

  const handleCopyShareUrl = useCallback(async () => {
    const shareUrl = new URL(window.location.href)

    if (meSlug) {
      shareUrl.searchParams.set('from', meSlug)
    }

    await copyToClipboard(shareUrl.toString())
    showCopiedIndicator('share')
  }, [copyToClipboard, meSlug, showCopiedIndicator])

  const notAvailableText = t('mentorPackage.bookPage.notAvailable')
  const updatedOnDisplay = mentorPackage?.modifiedOnUtc
    ? formatDate(mentorPackage.modifiedOnUtc)
    : formatDate(mentorPackage?.createdOnUtc)
  const averageFeedbackRatingDisplay = mentorPackage?.averageFeedbackRating?.toFixed(1) ?? notAvailableText

  if (isLoadingMentorPackage || isLoadingFeedbacks) {
    return <MentorPackageBookSkeleton />
  }

  return (
    <div className='relative pb-8 h-full overflow-y-auto'>
      <div className='relative'>
        <div className='bg-primary/95 relative overflow-visible'>
          {/* Headline */}
          <div className={`mx-auto max-w-6xl grid grid-cols-3 ${gridGapClass}`}>
            {/* Package Info */}
            <div className='col-span-2 relative'>
              <div className='px-6 pt-6 pb-16 space-y-6'>
                <Breadcrumb>
                  <BreadcrumbList>
                    <BreadcrumbItem>
                      <BreadcrumbLink asChild className='hover:text-background'>
                        <Link to={`/users/${mentorPackage?.creator.slug}`} className='text-background/85 font-medium'>
                          {mentorPackage?.creator.firstName} {mentorPackage?.creator.lastName}
                        </Link>
                      </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator className='text-background/75' />
                    <BreadcrumbItem>
                      <BreadcrumbPage className='text-background/95 font-medium'>{mentorPackage?.name}</BreadcrumbPage>
                    </BreadcrumbItem>
                  </BreadcrumbList>
                </Breadcrumb>

                <p className='text-background text-3xl font-bold'>{mentorPackage?.name}</p>
                <p className='text-sm text-background/90 text-justify'>
                  {getFirstParagraphTextFromHtml(mentorPackage?.description) || 'No description available.'}
                </p>

                <div className='flex items-center gap-6'>
                  <div className='flex items-center gap-1.5'>
                    <CalendarDaysIcon className='size-4 text-background' />
                    <p className='text-background text-sm'>
                      {t('mentorPackage.bookPage.updatedOn', { date: updatedOnDisplay })}
                    </p>
                  </div>

                  <div className='flex items-center gap-1.5'>
                    <GlobeIcon className='size-4 text-background' />
                    <p className='text-background text-sm'>{t('language.vietnamese')}</p>
                  </div>
                </div>
              </div>

              {/* Mentor Info + Package Card */}
              <Card className='absolute left-1/2 bottom-0 -translate-x-1/2 translate-y-1/2 w-full rounded-lg py-3 px-6 flex-row justify-between items-center'>
                <div className='flex items-center gap-4'>
                  <Avatar className='size-10 ring-2 ring-primary ring-offset-2'>
                    <AvatarImage src={mentorPackage?.creator.avatarUrl ?? undefined} />
                    <AvatarFallback>
                      {getAvatarFallback(`${mentorPackage?.creator.firstName} ${mentorPackage?.creator.lastName}`)}
                    </AvatarFallback>
                  </Avatar>

                  <div className='-space-y-1'>
                    <p className='font-semibold'>
                      {mentorPackage?.creator.firstName} {mentorPackage?.creator.lastName}
                    </p>
                    <p className='text-sm text-muted-foreground'>{mentorPackage?.creator.email}</p>
                  </div>
                </div>

                <div className='h-14 w-px bg-border' />

                <div className='flex flex-col items-center justify-between'>
                  <p className='text-xl font-bold'>{averageFeedbackRatingDisplay}</p>
                  <RatingField
                    value={(mentorPackage?.averageFeedbackRating as RatingValue) ?? 0}
                    setValue={() => {}}
                    size={11}
                    className='gap-0.5'
                  />

                  <PackageFeedbacksDialog>
                    <p className='underline text-xs text-muted-foreground mt-2 cursor-pointer'>
                      {t('mentorPackage.bookPage.ratingsCount', { count: mentorPackage?.totalFeedbacks ?? 0 })}
                    </p>
                  </PackageFeedbacksDialog>
                </div>

                <div className='h-10 w-px bg-border' />

                <div className='flex flex-col items-center justify-between'>
                  <UsersRoundIcon className='size-4 text-muted-foreground' />
                  <p className='text-xl font-bold'>{mentorPackage?.totalBuyers}</p>
                  <p className='text-xs text-muted-foreground'>{t('mentorPackage.bookPage.buyers')}</p>
                </div>
              </Card>
            </div>
          </div>
        </div>

        <div className='absolute inset-y-0 inset-x-0 pointer-events-none z-20'>
          <div className={`mx-auto h-full max-w-6xl grid grid-cols-3 grid-rows-[1fr] ${gridGapClass}`}>
            <div className='col-span-2' />
            <div className='col-span-1 pt-6'>
              <div className='sticky top-6 pointer-events-auto'>
                {/* Floating Card */}
                <Card className='rounded-xl p-1 gap-2 shadow-xl'>
                  {mentorPackage?.coverImageUrl ? (
                    <img
                      src={mentorPackage?.coverImageUrl ?? undefined}
                      alt={mentorPackage?.name}
                      className='w-full h-40 object-cover rounded-md'
                    />
                  ) : (
                    <img
                      src={placholderCoverImage}
                      alt={mentorPackage?.name}
                      className='w-full h-40 object-cover rounded-md'
                    />
                  )}

                  <div className='flex items-center justify-between w-full bg-emerald-50 p-4 rounded-md'>
                    <p className='text-4xl font-bold text-emerald-500'>
                      {formatCurrency(mentorPackage?.price ?? 0)}{' '}
                      {/* <span className='text-base font-normal line-through text-foreground/50'>
                          {formatCurrency(2449000)}
                        </span>{' '}
                        <span className='text-sm font-normal text-foreground/60'>
                          {t('mentorPackage.bookPage.discountPercent', { percent: 84 })}
                        </span> */}
                    </p>

                    <div className='flex flex-col items-center justify-center gap-1'>
                      <LockKeyholeIcon className='text-emerald-600 size-4' />
                      <p className='text-[10px] text-emerald-600 font-medium'>Secure Payment</p>
                    </div>
                  </div>

                  <div className='space-y-2 p-2'>
                    <div className='flex items-center justify-between gap-2'>
                      <p className='text-xs text-muted-foreground'>{t('packageBooking.bookPackage.sessions')}</p>
                      <p className='text-xs font-semibold'>{mentorPackage?.totalSessions}</p>
                    </div>

                    <div className='flex items-center justify-between gap-2'>
                      <p className='text-xs text-muted-foreground'>{t('mentorPackage.bookPage.activationDays')}</p>
                      <p className='text-xs font-semibold'>{mentorPackage?.activationDeadlineDays}</p>
                    </div>

                    <div className='flex items-center justify-between gap-2'>
                      <p className='text-xs text-muted-foreground'>{t('mentorPackage.bookPage.usageDays')}</p>
                      <p className='text-xs font-semibold'>{mentorPackage?.usageDeadlineDays}</p>
                    </div>

                    <div className='flex justify-center items-center gap-3 py-3 mt-2'>
                      <Button type='button' variant='outline' className='rounded-full' size='icon'>
                        <HeartIcon />
                      </Button>
                      <Button
                        type='button'
                        variant='outline'
                        className={cn(
                          'rounded-full',
                          isLinkCopied && 'pointer-events-none bg-emerald-100 border-emerald-300'
                        )}
                        size='icon'
                        onClick={handleCopyCurrentUrl}
                      >
                        {isLinkCopied ? <CheckCheckIcon className='text-emerald-600' /> : <LinkIcon />}
                      </Button>
                      <Button
                        type='button'
                        variant='outline'
                        className={cn(
                          'rounded-full',
                          isShareCopied && 'pointer-events-none bg-emerald-100 border-emerald-300'
                        )}
                        size='icon'
                        onClick={handleCopyShareUrl}
                      >
                        {isShareCopied ? <CheckCheckIcon className='text-emerald-600' /> : <Share2Icon />}
                      </Button>
                    </div>

                    {mentorPackage ? (
                      !isCreator ? (
                        <BookPackageDialog mentorPackage={mentorPackage}>
                          <Button className='w-full'>
                            <CalendarDaysIcon />
                            {t('packageBooking.bookPackage.proceed')}
                          </Button>
                        </BookPackageDialog>
                      ) : (
                        <Link to={`/packages/${mentorPackage.id}`}>
                          <Button className='w-full' size='sm' variant='outline'>
                            <SettingsIcon />
                            Manage Package
                          </Button>
                        </Link>
                      )
                    ) : null}
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </div>

        <div className={`mx-auto max-w-6xl grid grid-cols-3 items-start ${gridGapClass}`}>
          <div className='col-span-2 pt-18 space-y-14'>
            <div>
              <p className='text-xl font-bold'>{t('mentorPackage.form.description')}</p>
              {mentorPackage?.description ? (
                <SanitizedHtml html={mentorPackage.description} className='mt-2 text-justify' />
              ) : (
                <p className='text-sm text-muted-foreground'>No description available.</p>
              )}
            </div>

            {mentorPackage?.rules.length ? (
              <div className='space-y-2.5'>
                <div>
                  <p className='text-xl font-bold'>{t('mentorPackage.page.durationTitle')}</p>
                  <p className='text-xs text-muted-foreground'>{t('mentorPackage.page.durationDescription')}</p>
                </div>
                <div className='space-y-2'>
                  <Accordion type='single' collapsible className='w-full space-y-2'>
                    {mentorPackage.rules
                      .slice()
                      .sort((a, b) => a.no - b.no)
                      .map((rule) => (
                        <AccordionItem key={rule.id} value={`session-${rule.no}`}>
                          <AccordionTrigger className='px-2 py-2 hover:no-underline'>
                            <p className='text-sm font-medium'>
                              {t('mentorPackageRule.item.session')} {rule.no}
                            </p>
                          </AccordionTrigger>
                          <AccordionContent className='px-2 pb-2'>
                            <p>{t('mentorPackageRule.item.sessionTakesHours', { hours: rule.totalTimeSlots })}</p>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                  </Accordion>
                </div>
              </div>
            ) : null}

            {feedbacks.value.totalCount > 0 ? (
              <div className='space-y-3'>
                <div className='flex items-center gap-2'>
                  <div className='flex items-center gap-2'>
                    <StarIcon className='size-4 fill-amber-500 text-amber-500' />
                    <p className='text-xl font-bold'>
                      {t('mentorPackage.bookPage.courseRating', { rating: averageFeedbackRatingDisplay })}
                    </p>
                  </div>
                  <div className='size-1.5 bg-foreground/80 rounded-full' />
                  <p className='text-xl font-bold'>
                    {t('mentorPackage.bookPage.ratingsCount', { count: mentorPackage?.totalFeedbacks ?? 0 })}
                  </p>
                </div>

                <div className='grid grid-cols-2 gap-x-8 gap-y-6'>
                  {feedbacks.value.items.map((feedback) => (
                    <div key={feedback.id} className='border-t py-4'>
                      <div className='flex items-center gap-2'>
                        <Avatar className='size-9'>
                          <AvatarImage src={feedback.author.avatarUrl ?? ''} />
                          <AvatarFallback>
                            {getAvatarFallback(`${feedback.author.firstName} ${feedback.author.lastName}`)}
                          </AvatarFallback>
                        </Avatar>

                        <div>
                          <p className='text-sm font-medium'>
                            {feedback.author.firstName} {feedback.author.lastName}
                          </p>

                          <div className='flex items-center gap-2'>
                            <RatingField
                              value={feedback.rating as RatingValue}
                              setValue={() => {}}
                              size={10}
                              className='gap-0.5'
                            />

                            <p className='text-xs text-muted-foreground'>
                              {formatDistanceToNow(new Date(feedback.createdOnUtc), { addSuffix: true })}
                            </p>
                          </div>
                        </div>
                      </div>

                      <p className='text-sm text-muted-foreground py-2'>
                        {getFirstParagraphTextFromHtml(feedback.comment)}
                      </p>
                    </div>
                  ))}
                </div>

                <PackageFeedbacksDialog>
                  <Button variant='outline' className='w-full'>
                    {t('home.cards.teamChat.viewAll')}
                  </Button>
                </PackageFeedbacksDialog>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}
