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
import type { Mentor } from '@/features/mentors/types'
import { cn } from '@/shared/utils'
import { ArrowRightIcon, ChevronLeftIcon, ChevronRightIcon, SearchIcon, SparkleIcon, StarIcon } from 'lucide-react'
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

type HeroVisual = 'connection' | 'mentee' | 'mentor'

interface HeroSlide {
  eyebrow: string
  body: string
  cta: string
  visual: HeroVisual
  titleSegments: Array<{ text: string; tone?: 'default' | 'primary' | 'success' }>
  stats: Array<{ value: string; label: string }>
}

const HERO_SLIDES: HeroSlide[] = [
  {
    eyebrow: 'expertNetwork.hero.slides.connection.eyebrow',
    titleSegments: [
      { text: 'expertNetwork.hero.slides.connection.titleSegments.connect' },
      { text: 'expertNetwork.hero.slides.connection.titleSegments.mentor', tone: 'success' },
      { text: 'expertNetwork.hero.slides.connection.titleSegments.with' },
      { text: 'expertNetwork.hero.slides.connection.titleSegments.mentee', tone: 'primary' },
      { text: 'expertNetwork.hero.slides.connection.titleSegments.growth' }
    ],
    body: 'expertNetwork.hero.slides.connection.body',
    cta: 'expertNetwork.hero.slides.connection.cta',
    visual: 'connection',
    stats: [
      {
        value: 'expertNetwork.hero.slides.connection.stats.verifiedExperts.value',
        label: 'expertNetwork.hero.slides.connection.stats.verifiedExperts.label'
      },
      {
        value: 'expertNetwork.hero.slides.connection.stats.completedSessions.value',
        label: 'expertNetwork.hero.slides.connection.stats.completedSessions.label'
      },
      {
        value: 'expertNetwork.hero.slides.connection.stats.averageRating.value',
        label: 'expertNetwork.hero.slides.connection.stats.averageRating.label'
      }
    ]
  },
  {
    eyebrow: 'expertNetwork.hero.slides.mentee.eyebrow',
    titleSegments: [
      { text: 'expertNetwork.hero.slides.mentee.titleSegments.learnFrom' },
      { text: 'expertNetwork.hero.slides.mentee.titleSegments.experienced', tone: 'primary' },
      { text: 'expertNetwork.hero.slides.mentee.titleSegments.rightPath' }
    ],
    body: 'expertNetwork.hero.slides.mentee.body',
    cta: 'expertNetwork.hero.slides.mentee.cta',
    visual: 'mentee',
    stats: [
      {
        value: 'expertNetwork.hero.slides.mentee.stats.specialties.value',
        label: 'expertNetwork.hero.slides.mentee.stats.specialties.label'
      },
      {
        value: 'expertNetwork.hero.slides.mentee.stats.bookingResponse.value',
        label: 'expertNetwork.hero.slides.mentee.stats.bookingResponse.label'
      },
      {
        value: 'expertNetwork.hero.slides.mentee.stats.returningMentees.value',
        label: 'expertNetwork.hero.slides.mentee.stats.returningMentees.label'
      }
    ]
  },
  {
    eyebrow: 'expertNetwork.hero.slides.mentor.eyebrow',
    titleSegments: [
      { text: 'expertNetwork.hero.slides.mentor.titleSegments.shareExperience' },
      { text: 'expertNetwork.hero.slides.mentor.titleSegments.createImpact', tone: 'success' },
      { text: 'expertNetwork.hero.slides.mentor.titleSegments.getRecognized' }
    ],
    body: 'expertNetwork.hero.slides.mentor.body',
    cta: 'expertNetwork.hero.slides.mentor.cta',
    visual: 'mentor',
    stats: [
      {
        value: 'expertNetwork.hero.slides.mentor.stats.packageSetup.value',
        label: 'expertNetwork.hero.slides.mentor.stats.packageSetup.label'
      },
      {
        value: 'expertNetwork.hero.slides.mentor.stats.hiddenFees.value',
        label: 'expertNetwork.hero.slides.mentor.stats.hiddenFees.label'
      },
      {
        value: 'expertNetwork.hero.slides.mentor.stats.integrations.value',
        label: 'expertNetwork.hero.slides.mentor.stats.integrations.label'
      }
    ]
  }
]

interface HeroVisualTheme {
  badge: string
  chipClassName: string
  glowClassName: string
  panelGradientClassName: string
  spotlight: string
  subtitle: string
}

const HERO_VISUAL_THEMES: Record<HeroVisual, HeroVisualTheme> = {
  connection: {
    badge: 'expertNetwork.hero.visualThemes.connection.badge',
    chipClassName: 'bg-[#4f46e5]/22 text-[#22276d]',
    glowClassName: 'bg-[#5d78ef]/38',
    panelGradientClassName: 'from-[#e9efff] via-[#d3e3ff] to-[#c3ecf5]',
    spotlight: 'expertNetwork.hero.visualThemes.connection.spotlight',
    subtitle: 'expertNetwork.hero.visualThemes.connection.subtitle'
  },
  mentee: {
    badge: 'expertNetwork.hero.visualThemes.mentee.badge',
    chipClassName: 'bg-[#0ea5e9]/22 text-[#124f74]',
    glowClassName: 'bg-[#47afea]/38',
    panelGradientClassName: 'from-[#e8f4ff] via-[#d0ecff] to-[#beece8]',
    spotlight: 'expertNetwork.hero.visualThemes.mentee.spotlight',
    subtitle: 'expertNetwork.hero.visualThemes.mentee.subtitle'
  },
  mentor: {
    badge: 'expertNetwork.hero.visualThemes.mentor.badge',
    chipClassName: 'bg-[#14b8a6]/22 text-[#0f5a53]',
    glowClassName: 'bg-[#4ccfb6]/36',
    panelGradientClassName: 'from-[#eaf8f6] via-[#d2f4ee] to-[#c1edf4]',
    spotlight: 'expertNetwork.hero.visualThemes.mentor.spotlight',
    subtitle: 'expertNetwork.hero.visualThemes.mentor.subtitle'
  }
}

function HeroVisualPanel({ slide }: { slide: HeroSlide }) {
  const { t } = useTranslation()
  const theme = HERO_VISUAL_THEMES[slide.visual]
  const [firstStat, secondStat, thirdStat] = slide.stats

  return (
    <div className='relative h-[230px] w-full max-w-[520px] sm:h-[340px]'>
      <div className='absolute z-10 -left-1 top-8 hidden w-44 -rotate-[8deg] rounded-lg border border-white/85 bg-white/96 p-3 shadow-[0_16px_24px_-18px_rgba(14,30,66,0.48)] backdrop-blur sm:block'>
        <p className='text-[10px] font-semibold tracking-[0.14em] text-slate-500 uppercase'>
          {t('expertNetwork.hero.metrics.liveMetric')}
        </p>
        <p className='mt-1 text-xl font-black tracking-tight text-[#364da1]'>{t(firstStat.value)}</p>
        <p className='text-[11px] font-medium text-slate-600'>{t(firstStat.label)}</p>
      </div>

      <div className='absolute z-10 -right-1 top-6 hidden w-48 rotate-[6deg] rounded-lg border border-white/85 bg-white/96 p-3 shadow-[0_16px_24px_-18px_rgba(14,30,66,0.48)] backdrop-blur sm:block'>
        <p className='text-[10px] font-semibold tracking-[0.14em] text-slate-500 uppercase'>
          {t('expertNetwork.hero.metrics.activeFlow')}
        </p>
        <div className='mt-1 flex items-end gap-2'>
          <p className='text-2xl font-black leading-none tracking-tight text-[#2e5e99]'>{t(secondStat.value)}</p>
          <p className='mb-0.5 text-[11px] font-medium text-slate-600'>{t(secondStat.label)}</p>
        </div>
        <div className='mt-2 h-1.5 w-full rounded-full bg-slate-200'>
          <div className='h-full w-3/5 rounded-full bg-linear-to-r from-[#4f46e5] via-[#0ea5e9] to-[#14b8a6]' />
        </div>
      </div>

      <div
        className={cn(
          'absolute inset-x-0 top-0 overflow-hidden rounded-xl border border-white/85 bg-gradient-to-br p-4 shadow-[0_24px_38px_-24px_rgba(14,30,66,0.45)] ring-1 ring-white/55 sm:inset-x-7 sm:top-14 sm:px-6 sm:pb-6 sm:pt-14',
          theme.panelGradientClassName
        )}
      >
        <div className='mt-4 flex items-end gap-2'>
          <p className='text-5xl font-black leading-none tracking-tight text-[#22468f]'>{t(theme.spotlight)}</p>
          <p className='pb-1 text-sm font-semibold text-[#1f6789]'>{t(theme.subtitle)}</p>
        </div>

        <p className='mt-2 max-w-[90%] line-clamp-2 text-xs leading-relaxed text-[#345a7b] sm:line-clamp-none'>
          {t(slide.body)}
        </p>

        <div className='mt-4 flex items-center gap-2.5'>
          <Button className='h-9 rounded-lg bg-linear-to-r from-[#4f46e5] via-[#0ea5e9] to-[#14b8a6] px-4 text-white shadow-[0_14px_24px_-14px_rgba(14,116,144,0.62)] hover:from-[#433dc8] hover:via-[#0b90cb] hover:to-[#0e9a88]'>
            {t(slide.cta)}
            <ArrowRightIcon />
          </Button>

          <div className='hidden items-center gap-1.5 rounded-lg bg-white/75 px-2 py-1 sm:flex'>
            {slide.stats.map((item) => (
              <span key={item.label} className='h-1.5 w-1.5 rounded-full bg-[#3a86c9]' />
            ))}
          </div>
        </div>
      </div>

      <div className='absolute -bottom-1 left-1/2 hidden w-[82%] -translate-x-1/2 rounded-lg border border-white/80 bg-white/92 p-3 shadow-[0_18px_26px_-20px_rgba(14,30,66,0.52)] backdrop-blur sm:block'>
        <div className='flex items-center justify-between gap-2'>
          <div className='flex items-center gap-2'>
            <Avatar className='h-9 w-9 ring-2 ring-white'>
              <AvatarImage src='https://i.pravatar.cc/120?img=68' alt={t('expertNetwork.hero.visual.avatarAlt')} />
              <AvatarFallback>{t('expertNetwork.hero.visual.avatarFallback')}</AvatarFallback>
            </Avatar>
            <div>
              <p className='text-xs font-semibold text-[#305487]'>{t('expertNetwork.hero.metrics.mentorSpotlight')}</p>
              <p className='text-[11px] text-slate-600'>{t(thirdStat.label)}</p>
            </div>
          </div>

          <div className='text-right'>
            <p className='text-lg font-black leading-none tracking-tight text-[#305487]'>{t(thirdStat.value)}</p>
            <p className='text-[11px] text-slate-600'>{t('expertNetwork.hero.metrics.updatedToday')}</p>
          </div>
        </div>
      </div>

      <div
        className={cn(
          'pointer-events-none absolute -bottom-10 left-1/2 h-24 w-24 -translate-x-1/2 rounded-full blur-xl',
          theme.glowClassName
        )}
      />
    </div>
  )
}

const MentorCard = ({ mentor }: { mentor: Mentor }) => {
  const { t } = useTranslation()
  const initials = `${mentor.firstName?.[0] ?? ''}${mentor.lastName?.[0] ?? ''}`.toUpperCase()
  const fullName = `${mentor.firstName} ${mentor.lastName}`

  return (
    <Card className='col-span-12 flex h-full flex-col gap-4 overflow-hidden rounded-lg border-border/65 bg-card/95 p-5 shadow-none transition-all hover:-translate-y-0.5 hover:shadow-md md:col-span-6'>
      <div className='flex items-start gap-3.5'>
        <Avatar className='size-14 rounded-xl shadow-xs ring-1 ring-border/50'>
          <AvatarImage src={mentor.avatarUrl ?? undefined} alt={fullName} />
          <AvatarFallback className='rounded-xl'>{initials}</AvatarFallback>
        </Avatar>

        <div className='flex-1 min-w-0 flex flex-col pt-0.5 max-w-full'>
          <p className='truncate text-sm font-semibold'>{fullName}</p>
          <div className='mt-0.5'>
            <StarRow rating={mentor.rating ?? 0} />
          </div>
        </div>
      </div>

      {mentor.shortBio ? (
        <p className='line-clamp-2 text-xs leading-relaxed text-muted-foreground/85'>{mentor.shortBio}</p>
      ) : (
        <p className='text-xs italic text-muted-foreground/45'>{t('expertNetwork.noBio')}</p>
      )}

      {mentor.domains.length > 0 && (
        <div className='flex flex-wrap gap-1.5'>
          {mentor.domains.slice(0, 5).map((d) => (
            <Badge
              key={d.id}
              variant='secondary'
              className='border border-border/40 bg-secondary/60 px-2 py-0.5 text-[10px] font-medium'
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
        <Button size='sm' className='rounded-lg'>
          {t('expertNetwork.viewProfile')}
          <ArrowRightIcon />
        </Button>
      </Link>
    </Card>
  )
}

const MentorCardSkeleton = () => {
  return (
    <Card className='col-span-12 flex h-full flex-col gap-4 overflow-hidden rounded-2xl border border-border/50 bg-card p-5 shadow-sm md:col-span-6'>
      <div className='flex items-start gap-3.5'>
        <Skeleton className='size-14 rounded-xl' />
        <div className='flex min-w-0 flex-1 flex-col gap-1.5 pt-0.5'>
          <Skeleton className='h-4 w-4/5' />
          <Skeleton className='h-3 w-2/5' />
        </div>
      </div>
      <div className='space-y-2'>
        <Skeleton className='h-3 w-full' />
        <Skeleton className='h-3 w-11/12' />
      </div>
      <div className='flex flex-wrap gap-1.5'>
        <Skeleton className='h-5 w-20 rounded-md' />
        <Skeleton className='h-5 w-24 rounded-md' />
      </div>
      <Skeleton className='ml-auto mt-auto h-8 w-28 rounded-lg' />
    </Card>
  )
}

export default function NetworkPage() {
  const { t } = useTranslation()
  const [selectedDomainIds, setSelectedDomainIds] = useState<string[]>([])
  const [search, setSearch] = useState('')
  const [rating, setRating] = useState<RatingValue>()
  const [sortBy, setSortBy] = useState<'-rating' | 'rating'>('-rating')
  const [heroIndex, setHeroIndex] = useState(0)
  const [heroPaused, setHeroPaused] = useState(false)

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

  useEffect(() => {
    if (heroPaused) {
      return undefined
    }

    const interval = window.setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % HERO_SLIDES.length)
    }, 6500)

    return () => window.clearInterval(interval)
  }, [heroPaused])

  const activeSlide = HERO_SLIDES[heroIndex]

  const onReset = () => {
    setSelectedDomainIds([])
    setSearch('')
    setRating(undefined)
    setSortBy('-rating')
  }

  const hasActiveFilters =
    selectedDomainIds.length > 0 || search.length > 0 || rating !== undefined || sortBy !== '-rating'

  return (
    <div ref={setScrollContainer} className='h-full overflow-y-auto pb-6'>
      <div className='mx-auto w-full max-w-7xl space-y-6 px-4 py-4 md:px-6 lg:px-8'>
        <section
          className='network-hero-fx relative isolate min-h-[480px] overflow-hidden rounded-xl border border-sky-500/30 bg-linear-to-br from-[#413aa8] via-[#0b6fa8] to-[#107f74] shadow-[0_24px_44px_-30px_rgba(14,116,144,0.52)] sm:min-h-[720px] lg:min-h-[440px]'
          onMouseEnter={() => setHeroPaused(true)}
          onMouseLeave={() => setHeroPaused(false)}
        >
          <div className='absolute inset-0 bg-[radial-gradient(circle_at_top_left,#c4b5fd1f,transparent_44%),radial-gradient(circle_at_top_right,#7dd3fc24,transparent_42%),radial-gradient(circle_at_bottom_right,#5eead426,transparent_40%)]' />
          <div className='absolute -left-24 top-10 h-52 w-52 rounded-full bg-[#a78bfa]/16 blur-[90px]' />
          <div className='absolute -right-20 top-1/3 h-48 w-48 rounded-full bg-[#7dd3fc]/16 blur-[86px]' />
          <div className='absolute -bottom-16 left-1/2 h-44 w-44 -translate-x-1/2 rounded-full bg-[#5eead4]/14 blur-[80px]' />

          <div className='relative grid items-center gap-5 px-4 py-5 sm:px-6 sm:py-6 lg:grid-cols-[1.02fr_0.98fr] lg:gap-8 lg:px-8 lg:py-8'>
            <div>
              <Badge className='mb-3 rounded-md border border-white/55 bg-linear-to-r from-[#4f46e5]/88 via-[#0ea5e9]/84 to-[#14b8a6]/82 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-white shadow-[0_10px_20px_-15px_rgba(14,165,233,0.55)] ring-1 ring-white/28'>
                {t(activeSlide.eyebrow)}
              </Badge>

              <h2 className='min-h-[120px] text-[28px] leading-[1.06] font-black tracking-tight text-white md:min-h-[164px] md:text-[38px] lg:min-h-[148px] lg:text-[46px]'>
                {activeSlide.titleSegments.map((segment) => (
                  <span
                    key={`${segment.text}-${segment.tone ?? 'default'}`}
                    className={cn(
                      segment.tone === 'primary' &&
                        'font-bold text-[#bfe8ff] drop-shadow-[0_2px_8px_rgba(56,189,248,0.42)]',
                      segment.tone === 'success' &&
                        'font-bold text-[#cef8dc] drop-shadow-[0_2px_8px_rgba(74,222,128,0.36)]'
                    )}
                  >
                    {t(segment.text)}
                  </span>
                ))}
              </h2>

              <p className='mt-3 min-h-[66px] max-w-2xl text-sm leading-relaxed text-white/78 md:min-h-[72px] md:text-[15px]'>
                {t(activeSlide.body)}
              </p>

              <div className='mt-5 hidden max-w-lg grid-cols-3 gap-2 sm:grid'>
                {activeSlide.stats.map((stat) => (
                  <div
                    key={stat.label}
                    className='rounded-lg border border-white/30 bg-white/18 p-2.5 shadow-[0_14px_24px_-20px_rgba(255,255,255,0.85)] backdrop-blur-sm'
                  >
                    <p className='text-lg font-black tracking-tight text-white md:text-xl'>{t(stat.value)}</p>
                    <p className='text-[11px] text-white/72 md:text-xs'>{t(stat.label)}</p>
                  </div>
                ))}
              </div>

              <div className='mt-4 flex items-center gap-2 sm:hidden'>
                <Badge className='rounded-md border border-white/45 bg-white/16 px-2 py-1 text-[11px] text-white'>
                  {activeSlide.stats[0] ? t(activeSlide.stats[0].value) : ''}
                </Badge>
                <span className='text-xs text-white/80'>
                  {activeSlide.stats[0] ? t(activeSlide.stats[0].label) : ''}
                </span>
              </div>

              <div className='mt-5 flex flex-wrap items-center gap-2.5'>
                <Button className='network-hero-cta-fx h-9 rounded-lg bg-white px-4 text-[#244a86] shadow-[0_14px_24px_-16px_rgba(15,23,42,0.72)] hover:bg-white'>
                  {t(activeSlide.cta)}
                  <ArrowRightIcon />
                </Button>

                <div className='ml-0.5 hidden items-center gap-1.5 sm:flex'>
                  <Button
                    variant='outline'
                    size='icon'
                    className='size-8 rounded-lg border-white/45 bg-white/18 text-white hover:bg-white/28 hover:text-white'
                    onClick={() => setHeroIndex((heroIndex - 1 + HERO_SLIDES.length) % HERO_SLIDES.length)}
                    aria-label={t('expertNetwork.hero.controls.previousSlide')}
                  >
                    <ChevronLeftIcon className='size-4' />
                  </Button>
                  <Button
                    variant='outline'
                    size='icon'
                    className='size-8 rounded-lg border-white/45 bg-white/18 text-white hover:bg-white/28 hover:text-white'
                    onClick={() => setHeroIndex((heroIndex + 1) % HERO_SLIDES.length)}
                    aria-label={t('expertNetwork.hero.controls.nextSlide')}
                  >
                    <ChevronRightIcon className='size-4' />
                  </Button>
                </div>
              </div>
            </div>

            <div className='hidden justify-center sm:flex lg:justify-end'>
              <HeroVisualPanel slide={activeSlide} />
            </div>
          </div>

          <div className='relative z-10 flex justify-center gap-2 pb-4 pt-1.5'>
            {HERO_SLIDES.map((slide, index) => (
              <button
                key={slide.eyebrow}
                type='button'
                className='cursor-pointer border-0 bg-transparent p-0'
                onClick={() => setHeroIndex(index)}
                aria-label={t('expertNetwork.hero.controls.goToSlide', { index: index + 1 })}
              >
                <span
                  className={cn(
                    'block h-1.5 rounded-full transition-all duration-300',
                    index === heroIndex
                      ? 'w-8 bg-linear-to-r from-[#d8cbff] via-[#a8e4ff] to-[#aaf6e5]'
                      : 'w-1.5 bg-white/35'
                  )}
                />
              </button>
            ))}
          </div>
        </section>

        <div className='space-y-3 py-1 text-center my-14'>
          <p className='text-3xl font-bold tracking-tight md:text-4xl'>
            {t('expertNetwork.titlePrefix')}
            <span className='text-primary'>{t('expertNetwork.titleHighlight')}</span>
            {t('expertNetwork.titleSuffix')}
          </p>
          <p className='text-sm text-muted-foreground md:text-base'>{t('expertNetwork.subtitle')}</p>
          <div>
            <Button className='rounded-lg px-5 shadow-md shadow-primary/20'>
              <SparkleIcon />
              {t('expertNetwork.searchByAi')}
            </Button>
          </div>
        </div>

        <div className='grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)]'>
          <aside className='self-start lg:sticky lg:top-6'>
            <div className='space-y-6'>
              <div className='space-y-1.5'>
                <p className='text-sm font-semibold'>{t('expertNetwork.domainFilter')}</p>
                <DomainMultiSelect value={selectedDomainIds} onChange={setSelectedDomainIds} />
              </div>

              <div className='space-y-1.5'>
                <p className='text-sm font-semibold'>{t('expertNetwork.ratingFilter')}</p>
                <RatingField value={rating} setValue={setRating} size={26} />
              </div>

              <div className='space-y-1.5'>
                <p className='text-sm font-semibold'>{t('expertNetwork.sortByRating')}</p>
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
          </aside>

          <div className='space-y-4'>
            <div className='flex flex-col gap-2.5 sm:flex-row sm:items-center'>
              <InputGroup>
                <InputGroupAddon>
                  <SearchIcon className='size-4' />
                </InputGroupAddon>
                <InputGroupInput
                  placeholder={t('expertNetwork.searchPlaceholder')}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className='h-11'
                />
                <InputGroupAddon align='inline-end'>
                  <p className='text-xs text-muted-foreground md:text-sm'>
                    {t('expertNetwork.resultsCount', {
                      count: totalCount
                    })}
                  </p>
                </InputGroupAddon>
              </InputGroup>
              <Button
                variant='outline'
                className='h-9 rounded-lg sm:w-auto'
                onClick={onReset}
                disabled={!hasActiveFilters}
              >
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
              <p className='text-sm text-muted-foreground text-center py-10'>{t('expertNetwork.noMentorsFound')}</p>
            )}

            {/* Load-more sentinel */}
            {!isLoadingMentors && (
              <div ref={loadMoreRef} className='flex justify-center py-4'>
                {isFetchingNextPage && (
                  <div className='grid w-full grid-cols-12 gap-4'>
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
