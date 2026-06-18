import SanitizedHtml from '@/components/sanitized-html'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { formatDate } from '@/lib/date'
import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { ArrowLeftIcon, CalendarDaysIcon, EyeIcon, FileTextIcon, ImageIcon, PencilIcon, TagsIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { useGetArticle } from '../feature/article/hooks/use-get-article'
import { ArticleStatus, ArticleStatusLabel, type ArticleRow } from '../feature/article/types'

const ARTICLE_DETAIL_PREFIX = 'tenant.hoaTheoMua.articles.detail' as const

const getStatusClassName = (status: ArticleRow['status']) => {
  if (status === ArticleStatus.Published) {
    return 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300'
  }

  return 'border-muted bg-muted text-muted-foreground'
}

function DetailShell({ children }: { children: ReactNode }) {
  return (
    <div className='min-h-full overflow-y-auto bg-background'>
      <div className='mx-auto flex w-full max-w-7xl flex-col gap-5 p-4 md:p-6'>{children}</div>
    </div>
  )
}

function DetailState({ title, description, actionLabel }: { title: string; description: string; actionLabel: string }) {
  return (
    <DetailShell>
      <Card className='mx-auto w-full max-w-2xl overflow-hidden rounded-xl border-dashed'>
        <CardHeader className='items-center text-center'>
          <div className='flex size-12 items-center justify-center rounded-xl bg-muted text-muted-foreground'>
            <FileTextIcon data-icon='inline-start' />
          </div>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className='flex justify-center'>
          <Button asChild variant='outline'>
            <Link to='/htm/news'>
              <ArrowLeftIcon data-icon='inline-start' />
              {actionLabel}
            </Link>
          </Button>
        </CardContent>
      </Card>
    </DetailShell>
  )
}

function NewsDetailSkeleton() {
  return (
    <DetailShell>
      <div className='flex items-center justify-between gap-3'>
        <Skeleton className='h-9 w-28 rounded-lg' />
        <Skeleton className='h-9 w-24 rounded-lg' />
      </div>

      <div className='grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]'>
        <div className='flex flex-col gap-5'>
          <Skeleton className='aspect-[16/9] w-full rounded-2xl' />
          <div className='rounded-xl border bg-card p-5 md:p-7'>
            <Skeleton className='mb-4 h-7 w-32 rounded-full' />
            <Skeleton className='mb-3 h-10 w-4/5 rounded-lg' />
            <Skeleton className='mb-8 h-5 w-2/3 rounded-lg' />
            <div className='flex flex-col gap-3'>
              <Skeleton className='h-5 w-full rounded-lg' />
              <Skeleton className='h-5 w-11/12 rounded-lg' />
              <Skeleton className='h-5 w-10/12 rounded-lg' />
            </div>
          </div>
        </div>
        <Skeleton className='h-96 rounded-xl' />
      </div>
    </DetailShell>
  )
}

function FactRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className='grid grid-cols-[120px_minmax(0,1fr)] items-start gap-3 text-sm'>
      <p className='text-muted-foreground'>{label}</p>
      <div className='min-w-0 font-medium'>{value}</div>
    </div>
  )
}

export default function NewsDetailPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()

  const { t } = useTenantTranslation()
  const { article, isError, isLoadingArticle } = useGetArticle(id)

  if (!id) {
    return (
      <DetailState
        title={t(`${ARTICLE_DETAIL_PREFIX}.missingIdTitle`)}
        description={t(`${ARTICLE_DETAIL_PREFIX}.missingIdDescription`)}
        actionLabel={t('common.button.back')}
      />
    )
  }

  if (isLoadingArticle) {
    return <NewsDetailSkeleton />
  }

  if (isError || !article) {
    return (
      <DetailState
        title={t(`${ARTICLE_DETAIL_PREFIX}.notFoundTitle`)}
        description={t(`${ARTICLE_DETAIL_PREFIX}.notFoundDescription`)}
        actionLabel={t('common.button.back')}
      />
    )
  }

  const statusLabel = t(ArticleStatusLabel[article.status])
  const categoryCount = article.categories.length

  return (
    <div className='h-full overflow-y-auto'>
      <DetailShell>
        <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
          <Button type='button' variant='outline' size='sm' onClick={() => navigate('/htm/news')}>
            <ArrowLeftIcon data-icon='inline-start' />
            {t('common.button.back')}
          </Button>

          <Button asChild size='sm'>
            <Link to={`/htm/news/${id}/update`}>
              <PencilIcon data-icon='inline-start' />
              {t(`${ARTICLE_DETAIL_PREFIX}.edit`)}
            </Link>
          </Button>
        </div>

        <div className='grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]'>
          <main className='flex min-w-0 flex-col gap-5'>
            <section className='overflow-hidden rounded-2xl border bg-card'>
              {article.pictureUrl ? (
                <img src={article.pictureUrl} alt={article.title} className='aspect-[16/9] w-full object-cover' />
              ) : (
                <div className='flex aspect-[16/9] w-full items-center justify-center bg-muted text-muted-foreground'>
                  <ImageIcon className='size-10' />
                </div>
              )}
            </section>

            <article className='rounded-xl border bg-card p-5 md:p-8'>
              <div className='flex flex-wrap items-center gap-2'>
                <Badge variant='outline' className={getStatusClassName(article.status)}>
                  {statusLabel}
                </Badge>
                <Badge variant='secondary' className='gap-1'>
                  <EyeIcon data-icon='inline-start' />
                  {t(`${ARTICLE_DETAIL_PREFIX}.views`, { count: article.viewCount })}
                </Badge>
                <Badge variant='outline' className='gap-1'>
                  <TagsIcon data-icon='inline-start' />
                  {t(`${ARTICLE_DETAIL_PREFIX}.categories`, { count: categoryCount })}
                </Badge>
              </div>

              <div className='mt-5 flex flex-col gap-4'>
                <h1 className='max-w-4xl text-3xl font-semibold leading-tight tracking-tight md:text-5xl'>
                  {article.title}
                </h1>
                <div className='flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground'>
                  <span className='inline-flex items-center gap-1.5'>
                    <CalendarDaysIcon data-icon='inline-start' />
                    {t(`${ARTICLE_DETAIL_PREFIX}.createdAt`, { date: formatDate(article.createdAt, 'dateLong') })}
                  </span>
                  {article.updatedAt ? (
                    <span>
                      {t(`${ARTICLE_DETAIL_PREFIX}.updatedAt`, { date: formatDate(article.updatedAt, 'dateLong') })}
                    </span>
                  ) : null}
                </div>
              </div>

              <Separator className='my-7' />

              <SanitizedHtml html={article.description} as='section' className='max-w-none overflow-visible' />
            </article>
          </main>

          <aside className='flex flex-col gap-5 lg:sticky lg:top-4 lg:self-start'>
            <Card className='rounded-xl'>
              <CardHeader>
                <CardTitle className='text-base'>{t(`${ARTICLE_DETAIL_PREFIX}.overview`)}</CardTitle>
                <CardDescription>{t(`${ARTICLE_DETAIL_PREFIX}.overviewDescription`)}</CardDescription>
              </CardHeader>
              <CardContent className='flex flex-col gap-4'>
                <FactRow
                  label={t(`${ARTICLE_DETAIL_PREFIX}.articleId`)}
                  value={<span className='break-all'>{article.id}</span>}
                />
                <FactRow
                  label={t(`${ARTICLE_DETAIL_PREFIX}.slug`)}
                  value={<span className='break-all'>{article.slug}</span>}
                />
                <FactRow
                  label={t(`${ARTICLE_DETAIL_PREFIX}.authorId`)}
                  value={<span className='break-all'>{article.userId}</span>}
                />
                <FactRow label={t(`${ARTICLE_DETAIL_PREFIX}.status`)} value={statusLabel} />
              </CardContent>
            </Card>

            <Card className='rounded-xl'>
              <CardHeader>
                <CardTitle className='text-base'>{t(`${ARTICLE_DETAIL_PREFIX}.publishing`)}</CardTitle>
              </CardHeader>
              <CardContent className='grid grid-cols-2 gap-3'>
                <div className='rounded-lg border bg-muted/40 p-3'>
                  <p className='text-xs text-muted-foreground'>{t(`${ARTICLE_DETAIL_PREFIX}.viewsLabel`)}</p>
                  <p className='mt-1 text-2xl font-semibold tabular-nums'>{article.viewCount}</p>
                </div>
                <div className='rounded-lg border bg-muted/40 p-3'>
                  <p className='text-xs text-muted-foreground'>{t(`${ARTICLE_DETAIL_PREFIX}.categoriesLabel`)}</p>
                  <p className='mt-1 text-2xl font-semibold tabular-nums'>{categoryCount}</p>
                </div>
              </CardContent>
            </Card>
          </aside>
        </div>
      </DetailShell>
    </div>
  )
}
