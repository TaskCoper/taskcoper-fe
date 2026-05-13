import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FeaturedArticleHero } from '@/features/news/components/featured-article-hero'
import { FeaturedSideListItem } from '@/features/news/components/featured-side-list-item'
import { NewsArticleCard } from '@/features/news/components/news-article-card'
import { NewsArticleImage } from '@/features/news/components/news-article-image'
import { ALL_CATEGORIES, FEATURED_ARTICLES, LATEST_ARTICLES } from '@/features/news/mock-data'
import { cn } from '@/shared/utils'
import { ArrowRightIcon } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

export default function NewsPage() {
  const { t } = useTranslation()
  const [heroIndex, setHeroIndex] = useState(0)
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null)

  const heroArticle = FEATURED_ARTICLES[heroIndex]

  const sideArticles = useMemo(() => FEATURED_ARTICLES.filter((_, idx) => idx !== heroIndex).slice(0, 4), [heroIndex])

  const filteredLatest = useMemo(
    () =>
      activeCategoryId
        ? LATEST_ARTICLES.filter((article) => article.category.id === activeCategoryId)
        : LATEST_ARTICLES,
    [activeCategoryId]
  )

  const onPrev = () => setHeroIndex((heroIndex - 1 + FEATURED_ARTICLES.length) % FEATURED_ARTICLES.length)
  const onNext = () => setHeroIndex((heroIndex + 1) % FEATURED_ARTICLES.length)

  return (
    <div className='h-full overflow-y-auto bg-background pb-12'>
      <div className='mx-auto w-full max-w-7xl space-y-12 px-4 py-8 md:px-6 lg:px-8'>
        {/* Editorial masthead — minimal, no gradients */}
        <header className='border-b border-border pb-6'>
          <div className='flex items-center gap-2'>
            <span className='h-px w-8 bg-emerald-600' aria-hidden />
            <span className='text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-600'>
              {t('news.eyebrow')}
            </span>
          </div>
          <div className='mt-3 flex flex-wrap items-end justify-between gap-3'>
            <div>
              <h1 className='text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl'>
                {t('news.heroTitle')}
              </h1>
              <p className='mt-2 max-w-2xl text-sm text-muted-foreground sm:text-[15px]'>{t('news.heroSubtitle')}</p>
            </div>
            <span className='text-[11px] text-slate-500'>{t('news.liveUpdated')}</span>
          </div>
        </header>

        {/* Featured */}
        <section className='grid gap-6 lg:grid-cols-[1.65fr_1fr] lg:gap-10'>
          <FeaturedArticleHero article={heroArticle} onPrev={onPrev} onNext={onNext} />

          <div className='flex flex-col'>
            <div className='flex items-center gap-2 border-b border-border pb-2.5'>
              <span className='h-px w-6 bg-slate-900' aria-hidden />
              <span className='text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-700'>
                {t('news.trendingNow')}
              </span>
            </div>
            {sideArticles.map((article) => {
              const originalIndex = FEATURED_ARTICLES.findIndex((a) => a.id === article.id)
              return (
                <FeaturedSideListItem key={article.id} article={article} onSelect={() => setHeroIndex(originalIndex)} />
              )
            })}
          </div>
        </section>

        {/* Newsletter — full-width split: editorial image left, signup right */}
        <section className='overflow-hidden rounded-xl border border-border bg-card'>
          <div className='grid lg:grid-cols-2'>
            <div className='relative aspect-[16/9] w-full overflow-hidden bg-muted lg:aspect-auto lg:min-h-[300px]'>
              <NewsArticleImage
                src='https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=1600&h=1200&fit=crop'
                alt={t('news.newsletter.title')}
                seed='taskcoper-weekly-brief'
                className='h-full w-full object-cover'
              />
            </div>

            <div className='flex flex-col justify-center gap-3 p-4 sm:p-6 lg:p-8'>
              <div className='flex items-center gap-2'>
                <span className='h-px w-8 bg-emerald-600' aria-hidden />
                <span className='text-[11px] font-semibold uppercase tracking-[0.22em] text-emerald-700'>
                  {t('news.newsletter.eyebrow')}
                </span>
              </div>

              <h3 className='text-3xl font-bold leading-tight tracking-tight text-slate-900 sm:text-4xl'>
                {t('news.newsletter.title')}
              </h3>

              <p className='max-w-md text-[15px] leading-relaxed text-muted-foreground sm:text-base'>
                {t('news.newsletter.description')}
              </p>

              <form className='mt-3 flex max-w-md flex-col gap-2 sm:flex-row' onSubmit={(e) => e.preventDefault()}>
                <Input
                  type='email'
                  placeholder={t('news.newsletter.placeholder')}
                  className='h-11 flex-1 bg-background'
                  aria-label={t('news.newsletter.placeholder')}
                />
                <Button
                  type='submit'
                  className='h-11 rounded-md bg-slate-900 px-6 text-sm font-semibold text-white hover:bg-slate-800'
                >
                  {t('news.newsletter.cta')}
                  <ArrowRightIcon className='size-3.5' />
                </Button>
              </form>

              <p className='text-[11px] text-muted-foreground'>{t('news.newsletter.privacy')}</p>
            </div>
          </div>
        </section>

        {/* Latest */}
        <section className='space-y-6'>
          <div className='flex flex-wrap items-end justify-between gap-3 border-b border-border pb-4'>
            <div className='flex items-center gap-2'>
              <span className='h-px w-8 bg-emerald-600' aria-hidden />
              <h2 className='text-xl font-bold tracking-tight text-slate-900 sm:text-2xl'>{t('news.latest')}</h2>
            </div>
            <a
              href='/news?view=all'
              className='inline-flex items-center gap-1 text-xs font-semibold text-slate-700 hover:text-emerald-700'
            >
              {t('news.seeAll')}
              <ArrowRightIcon className='size-3.5' />
            </a>
          </div>

          {/* Category filter — ghost pills, minimal */}
          <div className='-mx-1 flex flex-wrap gap-x-5 gap-y-2 px-1'>
            <button
              type='button'
              onClick={() => setActiveCategoryId(null)}
              className={cn(
                'border-b-2 pb-1 text-xs font-semibold tracking-tight transition-colors',
                activeCategoryId === null
                  ? 'border-emerald-600 text-slate-900'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              )}
            >
              {t('news.allCategories')}
            </button>
            {ALL_CATEGORIES.map((category) => {
              const isActive = activeCategoryId === category.id
              return (
                <button
                  key={category.id}
                  type='button'
                  onClick={() => setActiveCategoryId(isActive ? null : category.id)}
                  className={cn(
                    'border-b-2 pb-1 text-xs font-semibold tracking-tight transition-colors',
                    isActive
                      ? 'border-emerald-600 text-slate-900'
                      : 'border-transparent text-slate-500 hover:text-slate-900'
                  )}
                >
                  {category.name}
                </button>
              )
            })}
          </div>

          {filteredLatest.length > 0 ? (
            <div className='grid grid-cols-12 gap-x-6 gap-y-9'>
              {filteredLatest.map((article) => (
                <NewsArticleCard key={article.id} article={article} />
              ))}
            </div>
          ) : (
            <p className='py-12 text-center text-sm text-muted-foreground'>{t('news.empty')}</p>
          )}
        </section>
      </div>
    </div>
  )
}
