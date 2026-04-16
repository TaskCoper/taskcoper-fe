import RatingField, { type RatingValue } from '@/components/rating-field'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import DomainMultiSelect from '@/features/mentors/components/domain-multi-select'
import { useGetMentorsInfinite } from '@/features/mentors/hooks/use-get-mentors-infinite'
import { cn } from '@/shared/utils'
import type { Mentor } from '@/types/user.type'
import { ArrowRightIcon, SearchIcon, SparkleIcon, StarIcon } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useInView } from 'react-intersection-observer'
import { Link } from 'react-router'
import { useDebounce } from 'use-debounce'

function StarRow({ rating }: { rating: number }) {
  return (
    <div className='flex items-center gap-1'>
      <div className='flex items-center gap-0.5'>
        {[1, 2, 3, 4, 5].map((s) => (
          <StarIcon
            key={s}
            className={cn(
              'size-3.5 stroke-[1.5]',
              s <= Math.round(rating) ? 'fill-amber-400 text-amber-400' : 'fill-muted text-muted'
            )}
          />
        ))}
      </div>
      <span className='text-xs font-semibold text-muted-foreground'>{rating.toFixed(1)}</span>
    </div>
  )
}

const MentorCard = ({ mentor }: { mentor: Mentor }) => {
  const { t } = useTranslation()
  const initials = `${mentor.firstName?.[0] ?? ''}${mentor.lastName?.[0] ?? ''}`.toUpperCase()
  const fullName = `${mentor.firstName} ${mentor.lastName}`

  return (
    <Card className='col-span-6 flex flex-col gap-5 overflow-hidden rounded-lg border border-border/60 p-4 shadow-none h-full'>
      <div className='flex items-start gap-3'>
        <Avatar className='size-14 rounded-md shadow-xs'>
          <AvatarImage src={mentor.avatarUrl ?? undefined} alt={fullName} />
          <AvatarFallback className='rounded-md'>{initials}</AvatarFallback>
        </Avatar>

        <div className='flex-1 min-w-0 flex flex-col pt-0.5 max-w-full'>
          <p className='font-semibold text-sm truncate'>{fullName}</p>
          <div className='mt-0.5'>
            <StarRow rating={mentor.rating} />
          </div>
        </div>
      </div>

      {mentor.shortBio ? (
        <p className='text-xs text-muted-foreground/80 line-clamp-2 leading-relaxed'>{mentor.shortBio}</p>
      ) : (
        <p className='text-xs text-muted-foreground/40 italic'>{t('expertNetwork.noBio')}</p>
      )}

      {mentor.domains.length > 0 && (
        <div className='flex flex-wrap gap-1.5'>
          {mentor.domains.slice(0, 5).map((d) => (
            <Badge
              key={d.id}
              variant='secondary'
              className='text-[10px] px-2 py-0.5 font-medium border border-border/30 bg-secondary/50'
            >
              {d.name}
            </Badge>
          ))}

          {mentor.domains.length > 5 && (
            <Badge
              variant='outline'
              className='text-[10px] px-2 py-0.5 border-dashed border-border/50 text-muted-foreground'
            >
              +{mentor.domains.length - 5}
            </Badge>
          )}
        </div>
      )}

      <Link to={`/users/${mentor.slug}`} className='ml-auto mt-auto'>
        <Button size='sm'>
          {t('expertNetwork.viewProfile')}
          <ArrowRightIcon />
        </Button>
      </Link>
    </Card>
  )
}

const MentorCardSkeleton = () => {
  return (
    <Card className='col-span-6 flex flex-col gap-5 overflow-hidden rounded-lg border border-border/40 bg-card p-4 shadow-none h-full'>
      <div className='flex items-start gap-3.5'>
        <Skeleton className='size-10 rounded-full' />
        <div className='flex-1 min-w-0 flex flex-col pt-0.5 gap-1.5'>
          <Skeleton className='h-4 w-3/4' />
          <Skeleton className='h-3 w-1/2' />
        </div>
      </div>
      <div className='space-y-1.5'>
        <Skeleton className='h-3 w-full' />
        <Skeleton className='h-3 w-5/6' />
        <Skeleton className='h-3 w-4/6' />
      </div>
      <div className='flex flex-wrap gap-1.5'>
        <Skeleton className='h-5 w-16 rounded-md' />
        <Skeleton className='h-5 w-20 rounded-md' />
      </div>
      <Skeleton className='h-8 w-24 rounded-md ml-auto mt-auto' />
    </Card>
  )
}

export default function NetworkPage() {
  const { t } = useTranslation()
  const [selectedDomainIds, setSelectedDomainIds] = useState<string[]>([])
  const [search, setSearch] = useState('')
  const [rating, setRating] = useState<RatingValue>()
  const [sortBy, setSortBy] = useState<'-rating' | 'rating'>('-rating')

  const [debouncedSearch] = useDebounce(search, 300)

  const [scrollContainer, setScrollContainer] = useState<HTMLDivElement | null>(null)
  const { ref: loadMoreRef, inView } = useInView({ threshold: 0.1, root: scrollContainer })

  const {
    mentors,
    totalCount,
    isLoading: isLoadingMentors,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage
  } = useGetMentorsInfinite({
    domainIds: selectedDomainIds.length > 0 ? selectedDomainIds : undefined,
    searchTerm: debouncedSearch || undefined,
    rating,
    sortBy: [sortBy]
  })

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage()
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage])

  const onReset = () => {
    setSelectedDomainIds([])
    setSearch('')
    setRating(undefined)
    setSortBy('-rating')
  }

  return (
    <div ref={setScrollContainer} className='h-full overflow-y-auto pb-4'>
      <div className='max-w-6xl mx-auto p-4'>
        <div className='text-center mt-8 mb-10 space-y-4'>
          <p className='text-3xl font-bold'>
            {t('expertNetwork.titlePrefix')}
            <span className='text-primary'>{t('expertNetwork.titleHighlight')}</span>
            {t('expertNetwork.titleSuffix')}
          </p>

          <div className='space-y-2'>
            <p className='text-foreground/80'>{t('expertNetwork.subtitle')}</p>

            <Button>
              <SparkleIcon />
              {t('expertNetwork.searchByAi')}
            </Button>
          </div>
        </div>

        <div className='flex gap-4'>
          <div className='w-[25%] space-y-10 flex flex-col sticky top-4 self-start'>
            <div className='space-y-1'>
              <p className='font-medium'>{t('expertNetwork.domainFilter')}</p>
              <DomainMultiSelect value={selectedDomainIds} onChange={setSelectedDomainIds} />
            </div>

            <div className='space-y-1'>
              <p className='font-medium'>{t('expertNetwork.ratingFilter')}</p>
              <RatingField value={rating} setValue={setRating} />
            </div>

            <div className='space-y-1'>
              <p className='font-medium'>{t('expertNetwork.sortByRating')}</p>
              <Select value={sortBy} onValueChange={(val: 'rating' | '-rating') => setSortBy(val)}>
                <SelectTrigger className='w-full bg-background'>
                  <SelectValue placeholder={t('expertNetwork.sortPlaceholder')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='-rating'>{t('expertNetwork.sortHighest')}</SelectItem>
                  <SelectItem value='rating'>{t('expertNetwork.sortLowest')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className='w-[75%] space-y-4'>
            <div className='flex items-center gap-2'>
              <InputGroup>
                <InputGroupInput
                  placeholder={t('expertNetwork.searchPlaceholder')}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <InputGroupAddon>
                  <SearchIcon />
                </InputGroupAddon>
                <InputGroupAddon align='inline-end'>
                  <p className='text-muted-foreground'>
                    {t('expertNetwork.resultsCount', {
                      count: totalCount,
                      defaultValue: `${totalCount} kết quả`
                    })}
                  </p>
                </InputGroupAddon>
              </InputGroup>
              <Button variant='outline' onClick={onReset}>
                {t('expertNetwork.reset')}
              </Button>
            </div>

            {isLoadingMentors ? (
              <div className='grid grid-cols-12 gap-4'>
                {Array.from({ length: 4 }).map((_, i) => (
                  <MentorCardSkeleton key={i} />
                ))}
              </div>
            ) : mentors.length > 0 ? (
              <div className='grid grid-cols-12 gap-4'>
                {mentors.map((mentor) => (
                  <MentorCard key={mentor.id} mentor={mentor} />
                ))}
              </div>
            ) : (
              <p>{t('expertNetwork.noMentorsFound')}</p>
            )}

            {/* Load-more sentinel */}
            {!isLoadingMentors && (
              <div ref={loadMoreRef} className='py-4 flex justify-center'>
                {isFetchingNextPage && (
                  <div className='grid grid-cols-12 gap-4 w-full'>
                    {Array.from({ length: 2 }).map((_, i) => (
                      <MentorCardSkeleton key={i} />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
