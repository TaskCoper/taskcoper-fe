import { cn } from '@/shared/utils'
import { formatDistanceToNow } from 'date-fns'
import { vi } from 'date-fns/locale'
import { useTranslation } from 'react-i18next'
import type { NewsArticle } from '../types'
import { NewsArticleImage } from './news-article-image'

interface NewsArticleCardProps {
  article: NewsArticle
}

export function NewsArticleCard({ article }: NewsArticleCardProps) {
  const { t } = useTranslation()
  const relativeTime = formatDistanceToNow(new Date(article.publishedAt), { addSuffix: true, locale: vi })

  return (
    <a
      href={article.url}
      target='_blank'
      rel='noopener noreferrer'
      className='group col-span-12 flex flex-col sm:col-span-6 lg:col-span-4'
    >
      <div className='relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-muted lg:aspect-[5/4]'>
        <NewsArticleImage
          src={article.coverUrl}
          alt={article.title}
          seed={article.slug}
          className='transition-transform duration-500 group-hover:scale-[1.03]'
        />
      </div>

      <div className='mt-3.5 flex flex-1 flex-col gap-2'>
        <div className='flex items-center gap-2'>
          <span className={cn('size-1.5 rounded-full', article.category.bgClassName)} aria-hidden />
          <span className='text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-600'>
            {article.category.name}
          </span>
        </div>

        <p className='text-[15px] font-bold leading-snug text-slate-900 line-clamp-3 group-hover:text-emerald-700'>
          {article.title}
        </p>

        <p className='text-xs leading-relaxed text-muted-foreground line-clamp-2'>{article.excerpt}</p>

        <div className='mt-auto flex items-center gap-1.5 pt-1 text-[11px] text-muted-foreground'>
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
