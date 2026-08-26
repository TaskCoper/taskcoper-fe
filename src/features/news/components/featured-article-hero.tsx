import { Button } from '@/components/ui/button'
import { useDateFormat } from '@/lib/date'
import { cn } from '@/shared/utils'
import { ChevronLeftIcon, ChevronRightIcon, ExternalLinkIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { NewsArticle } from '../types'
import { NewsArticleImage } from './news-article-image'
import { NewsSourceRow } from './news-source-row'

interface FeaturedArticleHeroProps {
  article: NewsArticle
  onPrev: () => void
  onNext: () => void
}

export function FeaturedArticleHero({ article, onPrev, onNext }: FeaturedArticleHeroProps) {
  const { t } = useTranslation()
  const { formatDate } = useDateFormat()

  return (
    <div
      className={cn(
        'relative w-full overflow-hidden rounded-xl border border-border bg-card',
        'aspect-[16/12] sm:aspect-[16/10] lg:aspect-[4/3]'
      )}
    >
      <div className='absolute inset-0 overflow-hidden'>
        <NewsArticleImage
          src={article.coverUrl}
          alt={article.title}
          seed={article.slug}
          loading='eager'
          className='transition-transform duration-700 ease-out hover:scale-[1.02]'
        />
      </div>

      {/* Subtle bottom gradient only - for legibility */}
      <div className='absolute inset-0 bg-linear-to-t from-slate-950/60 via-slate-950/10 to-transparent' />

      {/* Minimal eyebrow label, top-left */}
      <div className='absolute left-5 top-5 sm:left-6 sm:top-6'>
        <span className='text-[10px] font-semibold uppercase tracking-[0.18em] text-white/85'>
          {t('news.topStory')}
        </span>
      </div>

      <div className='absolute left-3 right-3 bottom-3 sm:left-6 sm:bottom-6 sm:max-w-[68%]'>
        <div className='rounded-xl border border-border bg-white p-5 sm:p-6'>
          <div className='flex items-center gap-2'>
            <span className='size-1.5 rounded-full bg-emerald-500' aria-hidden />
            <span className='text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-700'>
              {article.category.name}
            </span>
          </div>

          <a href={article.url} target='_blank' rel='noopener noreferrer' className='group mt-2 block'>
            <h2 className='text-xl font-bold leading-[1.15] tracking-tight text-slate-900 line-clamp-3 group-hover:text-emerald-700 sm:text-2xl md:text-[28px]'>
              {article.title}
            </h2>
          </a>

          <p className='mt-3 hidden text-sm leading-relaxed text-muted-foreground line-clamp-3 sm:block'>
            {article.excerpt}{' '}
            <a
              href={article.url}
              target='_blank'
              rel='noopener noreferrer'
              className='inline-flex items-center gap-0.5 font-semibold text-emerald-700 hover:text-emerald-900'
            >
              {t('news.readMore')}
              <ExternalLinkIcon className='size-3' />
            </a>
          </p>

          <div className='mt-5 flex items-center justify-between gap-3 border-t border-border pt-3'>
            <div className='flex items-center gap-3'>
              <NewsSourceRow source={article.source} publishedAt={article.publishedAt} size='md' />
              <span className='hidden text-[11px] text-muted-foreground sm:inline'>
                · {formatDate(article.publishedAt, 'dateMedium')}
              </span>
            </div>

            <div className='flex items-center gap-1'>
              <Button
                type='button'
                variant='ghost'
                size='icon'
                className='size-7 rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-900'
                onClick={onPrev}
                aria-label={t('news.previousFeatured')}
              >
                <ChevronLeftIcon className='size-4' />
              </Button>
              <Button
                type='button'
                variant='ghost'
                size='icon'
                className='size-7 rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-900'
                onClick={onNext}
                aria-label={t('news.nextFeatured')}
              >
                <ChevronRightIcon className='size-4' />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
