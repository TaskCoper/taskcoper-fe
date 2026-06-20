import SanitizedHtml from '@/components/sanitized-html'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { formatDate } from '@/lib/date'
import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { getAvatarFallback } from '@/shared/utils'
import { ArrowLeftIcon, FileTextIcon, ImageIcon, PencilIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { useGetArticle } from '../features/article/hooks/use-get-article'
import { ArticleStatus, ArticleStatusLabel, type ArticleRow } from '../features/article/types'

const ARTICLE_DETAIL_PREFIX = 'articles.detail' as const

const ARTICLE_CONTENT_CLASS_NAME = [
  'mx-auto w-full max-w-4xl overflow-visible',
  'text-base leading-8 text-slate-800 md:text-lg',
  '[&_p]:my-5 [&_p]:text-base [&_p]:leading-8 [&_p]:text-slate-800 md:[&_p]:text-lg',
  '[&_h1]:mb-5 [&_h1]:mt-10 [&_h1]:text-3xl [&_h1]:font-bold [&_h1]:leading-tight',
  '[&_h2]:mb-4 [&_h2]:mt-9 [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:leading-tight',
  '[&_h3]:mb-3 [&_h3]:mt-8 [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:leading-snug',
  '[&_h4]:mb-3 [&_h4]:mt-7 [&_h4]:text-lg [&_h4]:font-semibold',
  '[&_h5]:mb-2 [&_h5]:mt-6 [&_h5]:text-base [&_h5]:font-semibold',
  '[&_h6]:mb-2 [&_h6]:mt-6 [&_h6]:text-sm [&_h6]:font-semibold [&_h6]:uppercase [&_h6]:text-muted-foreground',
  '[&_ul]:my-5 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-6',
  '[&_ol]:my-5 [&_ol]:list-decimal [&_ol]:space-y-2 [&_ol]:pl-6',
  '[&_li]:pl-1 [&_li]:leading-8',
  '[&_blockquote]:my-7 [&_blockquote]:border-l-4 [&_blockquote]:border-[#0b66e4] [&_blockquote]:bg-muted/50 [&_blockquote]:py-3 [&_blockquote]:pl-5 [&_blockquote]:pr-4 [&_blockquote]:italic',
  '[&_pre]:my-7 [&_pre]:overflow-x-auto [&_pre]:rounded-xl [&_pre]:border [&_pre]:bg-muted [&_pre]:p-4 [&_pre]:text-sm',
  '[&_code]:rounded [&_code]:bg-muted [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:text-[0.9em]',
  '[&_pre_code]:bg-transparent [&_pre_code]:p-0',
  '[&_img]:mx-auto [&_img]:my-8 [&_img]:block [&_img]:h-auto [&_img]:w-full [&_img]:max-w-full [&_img]:rounded-xl [&_img]:object-cover',
  '[&_a]:text-[#0b66e4] [&_a]:underline-offset-4 [&_a:hover]:underline'
].join(' ')

const getStatusClassName = (status: ArticleRow['status']) => {
  if (status === ArticleStatus.Published) {
    return 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300'
  }

  return 'border-muted bg-muted text-muted-foreground'
}

function DetailShell({ children }: { children: ReactNode }) {
  return <div className='min-h-full overflow-y-auto bg-background'>{children}</div>
}

function DetailState({ title, description, actionLabel }: { title: string; description: string; actionLabel: string }) {
  return (
    <DetailShell>
      <div className='mx-auto flex min-h-full w-full max-w-7xl items-center justify-center px-4 py-10 sm:px-6 lg:px-8'>
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
      </div>
    </DetailShell>
  )
}

function NewsDetailSkeleton() {
  return (
    <DetailShell>
      <div className='mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 pt-6 pb-10 sm:px-6 lg:grid-cols-12 lg:px-8'>
        <div className='lg:col-span-12'>
          <Skeleton className='h-9 w-28 rounded-lg' />
        </div>

        <div className='lg:col-span-8'>
          <Skeleton className='h-48 rounded-2xl sm:h-52' />
          <div className='my-8 space-y-4'>
            <Skeleton className='h-9 w-4/5 max-w-2xl rounded-lg' />
            <Skeleton className='h-5 w-72 rounded-lg' />
          </div>
          <Skeleton className='h-80 rounded-2xl' />
          <Skeleton className='mt-6 h-36 rounded-2xl' />
        </div>

        <div className='space-y-6 lg:col-span-4'>
          <Skeleton className='h-10 w-full rounded-lg' />
          <Skeleton className='h-24 w-full rounded-lg' />
          <Skeleton className='h-28 w-full rounded-lg' />
          <Skeleton className='h-28 w-full rounded-lg' />
          <Skeleton className='h-32 w-full rounded-lg' />
          <Skeleton className='h-56 w-full rounded-2xl' />
        </div>
      </div>
    </DetailShell>
  )
}

function SidebarSection({
  title,
  description,
  children
}: {
  title: string
  description?: string
  children: ReactNode
}) {
  return (
    <div className='space-y-2'>
      <div className='flex items-start justify-between gap-2'>
        <div>
          <p className='font-semibold'>{title}</p>
          {description ? <p className='text-xs text-muted-foreground'>{description}</p> : null}
        </div>
      </div>

      {children}
    </div>
  )
}

function MetadataRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className='flex items-center justify-between gap-3 rounded-md py-1 transition-colors hover:bg-muted/40'>
      <p className='text-xs font-medium text-muted-foreground'>{label}</p>
      <div
        className='max-w-[70%] truncate text-right text-xs font-semibold'
        title={typeof value === 'string' ? value : undefined}
      >
        {value}
      </div>
    </div>
  )
}

function AuthorAvatar({
  name,
  avatarUrl,
  className,
  fallbackClassName = 'text-sm'
}: {
  name: string
  avatarUrl?: string | null
  className: string
  fallbackClassName?: string
}) {
  return (
    <Avatar className={className}>
      <AvatarImage src={avatarUrl ?? undefined} alt={name} />
      <AvatarFallback className={`${fallbackClassName} font-semibold`}>{getAvatarFallback(name)}</AvatarFallback>
    </Avatar>
  )
}

function AuthorProfileCard({
  title,
  description,
  name,
  email,
  avatarUrl
}: {
  title: string
  description: string
  name: string
  email?: string
  avatarUrl?: string | null
}) {
  return (
    <Card className='rounded-2xl shadow-none'>
      <CardHeader className='gap-1 pb-3'>
        <CardTitle className='text-base'>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className='flex flex-col items-center gap-4 text-center'>
        <AuthorAvatar name={name} avatarUrl={avatarUrl} className='size-16 ring-2 ring-background' />
        <div className='min-w-0 space-y-1'>
          <p className='truncate text-base font-semibold'>{name}</p>
          {email ? (
            <a className='block truncate text-sm text-muted-foreground hover:text-foreground' href={`mailto:${email}`}>
              {email}
            </a>
          ) : null}
        </div>
      </CardContent>
    </Card>
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
  const authorEmail = article.user.email.trim()
  const authorFullName = `${article.user.userFirstName} ${article.user.userLastName}`.trim()
  const authorName = authorFullName || authorEmail || t(`${ARTICLE_DETAIL_PREFIX}.unknownAuthor`)
  const authorAvatarUrl = article.user.userAvatar

  return (
    <div className='h-full overflow-y-auto'>
      <DetailShell>
        <article className='mx-auto grid max-w-7xl grid-cols-1 px-4 pt-8 pb-20 sm:px-6 lg:grid-cols-12 lg:gap-8 lg:px-8'>
          <div className='col-span-1 mb-4 flex items-center justify-between gap-3 lg:col-span-12'>
            <Button
              type='button'
              variant='ghost'
              size='sm'
              onClick={() => navigate('/htm/news')}
              className='w-fit px-0 text-muted-foreground hover:bg-transparent hover:text-foreground'
            >
              <ArrowLeftIcon data-icon='inline-start' />
              {t('common.button.back')}
            </Button>
          </div>

          <div className='col-span-1 lg:col-span-8'>
            <div className='relative h-48 sm:h-52'>
              <div className='relative size-full'>
                {article.pictureUrl ? (
                  <img
                    src={article.pictureUrl}
                    alt={article.title}
                    className='size-full rounded-2xl border border-border object-cover shadow-sm'
                  />
                ) : (
                  <div className='flex size-full items-center justify-center rounded-2xl bg-muted text-muted-foreground'>
                    <ImageIcon className='size-10' />
                  </div>
                )}
              </div>
            </div>

            <div className='my-8 flex flex-col items-center space-y-3 text-center lg:items-start lg:text-left'>
              <div className='w-full lg:px-6'>
                <h1 className='wrap-break-word text-2xl font-semibold tracking-tight sm:text-3xl'>{article.title}</h1>
              </div>

              <div className='w-full lg:px-6'>
                <p className='text-xs text-muted-foreground'>
                  {formatDate(article.createdAt, 'dateLong')} •{' '}
                  {t(`${ARTICLE_DETAIL_PREFIX}.views`, { count: article.viewCount })}
                </p>
              </div>
            </div>

            <Card className='w-full gap-0 rounded-2xl p-0 text-left text-sm shadow-none sm:text-base'>
              <div className='flex items-center gap-2 rounded-t-2xl bg-muted/60 px-3 py-2'>
                <FileTextIcon className='size-4 text-muted-foreground' />
                <p className='text-sm font-semibold text-muted-foreground'>{t(`${ARTICLE_DETAIL_PREFIX}.overview`)}</p>
              </div>
              <Separator />
              <div className='p-4'>
                <SanitizedHtml html={article.description} as='section' className={ARTICLE_CONTENT_CLASS_NAME} />
              </div>
            </Card>
          </div>

          <aside className='col-span-1 mt-8 space-y-6 lg:col-span-4 lg:mt-0'>
            <Button asChild className='w-full justify-center' aria-label={t(`${ARTICLE_DETAIL_PREFIX}.edit`)}>
              <Link to={`/htm/news/${id}/update`}>
                {t('articles.action.updateDetails')}
                <PencilIcon className='size-4' />
              </Link>
            </Button>

            <AuthorProfileCard
              title={t(`${ARTICLE_DETAIL_PREFIX}.aboutAuthor`)}
              description={t(`${ARTICLE_DETAIL_PREFIX}.authorFallbackDescription`)}
              name={authorName}
              email={authorEmail || undefined}
              avatarUrl={authorAvatarUrl}
            />

            <SidebarSection
              title={t(`${ARTICLE_DETAIL_PREFIX}.publishing`)}
              description={t(`${ARTICLE_DETAIL_PREFIX}.overviewDescription`)}
            >
              <div className='mt-4 space-y-3'>
                <div className='flex items-center justify-between gap-3'>
                  <p className='text-xs font-medium text-muted-foreground'>{t(`${ARTICLE_DETAIL_PREFIX}.status`)}</p>
                  <Badge variant='outline' className={getStatusClassName(article.status)}>
                    {statusLabel}
                  </Badge>
                </div>
                <MetadataRow
                  label={t(`${ARTICLE_DETAIL_PREFIX}.viewsLabel`)}
                  value={t(`${ARTICLE_DETAIL_PREFIX}.views`, { count: article.viewCount })}
                />
              </div>
            </SidebarSection>

            <Separator />

            <SidebarSection title={t(`${ARTICLE_DETAIL_PREFIX}.categoriesLabel`)}>
              <div className='mt-4 flex flex-wrap gap-2'>
                {article.categories.map((category) => (
                  <Badge
                    key={category.categoryId}
                    variant='secondary'
                    className='max-w-full whitespace-normal break-words'
                  >
                    {category.categoryName}
                  </Badge>
                ))}
              </div>
            </SidebarSection>
            <Separator />

            <SidebarSection title={t(`${ARTICLE_DETAIL_PREFIX}.overview`)}>
              <div className='mt-4 space-y-3'>
                <MetadataRow
                  label={t(`${ARTICLE_DETAIL_PREFIX}.createdAtLabel`)}
                  value={formatDate(article.createdAt, 'dateLong')}
                />
                <MetadataRow
                  label={t(`${ARTICLE_DETAIL_PREFIX}.updatedAtLabel`)}
                  value={
                    article.updatedAt ? (
                      formatDate(article.updatedAt, 'dateLong')
                    ) : (
                      <span className='text-muted-foreground/40'>-</span>
                    )
                  }
                />
              </div>
            </SidebarSection>
          </aside>
        </article>
      </DetailShell>
    </div>
  )
}
