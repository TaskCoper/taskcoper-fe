import { useDateFormat } from '@/lib/date'
import { cn } from '@/shared/utils'
import { useTranslation } from 'react-i18next'
import type { NewsArticle } from '../types'
import { NewsArticleImage } from './news-article-image'

interface FeaturedSideListItemProps {
  article: NewsArticle
  onSelect?: () => void
}

export function FeaturedSideListItem({ article, onSelect }: FeaturedSideListItemProps) {
  const { t } = useTranslation()
  const { formatRelative } = useDateFormat()
  const relativeTime = formatRelative(article.publishedAt)

  return (
    <a
      href={article.url}
      target='_blank'
      rel='noopener noreferrer'
      onMouseEnter={onSelect}
      onFocus={onSelect}
      className='group flex items-start gap-3 border-b border-border py-3.5 last:border-b-0'
    >
      <div className='size-20 shrink-0 overflow-hidden rounded-md bg-muted sm:size-[88px]'>
        <NewsArticleImage
          src={article.coverUrl}
          alt={article.title}
          seed={article.slug}
          className='transition-transform duration-500 group-hover:scale-105'
        />
      </div>

      <div className='min-w-0 flex-1'>
        <div className='flex items-center gap-2'>
          <span className={cn('size-1.5 rounded-full', article.category.bgClassName)} aria-hidden />
          <span className='text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-600'>
            {article.category.name}
          </span>
        </div>

        <p className='mt-1 text-sm font-semibold leading-snug text-slate-900 line-clamp-2 group-hover:text-emerald-700'>
          {article.title}
        </p>

        <div className='mt-1.5 flex items-center gap-1.5 text-[11px] text-muted-foreground'>
          <span className='font-semibold text-slate-700'>{article.source.shortName}</span>
          <span aria-hidden>·</span>
          <span>{relativeTime}</span>
          <span aria-hidden>·</span>
          <span>{t('news.minRead', { count: article.readTimeMinutes })}</span>
        </div>
      </div>
    </a>
  )
}
