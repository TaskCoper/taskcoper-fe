import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Spinner } from '@/components/ui/spinner'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { useMutation } from '@tanstack/react-query'
import { ChevronLeftIcon, ChevronRightIcon, DownloadIcon, ExternalLinkIcon, RefreshCwIcon } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router'
import { toast } from 'sonner'
import { HOA_THEO_MUA_ROUTE_PREFIX } from '../../../../config'
import { importErrorLabel, importRequestError } from '../error'
import { useImportDetail } from '../hooks'
import service from '../services'
import type { ImportRow } from '../types'

const names = { zalo: 'Zalo OA', facebook: 'Facebook', instagram: 'Instagram' }

function RowResult({ row }: { row: ImportRow }) {
  const { t } = useTenantTranslation()
  return (
    <TableRow>
      <TableCell className='align-top text-muted-foreground'>{row.rowNumber}</TableCell>
      <TableCell className='min-w-36 max-w-64 whitespace-normal align-top'>
        <p className='font-mono text-xs break-all'>{row.code || '—'}</p>
        <p className='mt-1 line-clamp-2 text-sm'>{row.title}</p>
        {row.basePostId && (
          <Link
            className='mt-2 inline-block text-xs text-primary underline'
            to={`/${HOA_THEO_MUA_ROUTE_PREFIX}/ai-marketing/posts/${row.basePostId}`}
          >
            {t('marketingPosts.bulkImport.openPost')}
          </Link>
        )}
      </TableCell>
      <TableCell className='align-top'>
        <Badge variant='outline'>{t(`marketingPosts.bulkImport.status.${row.status}`)}</Badge>
      </TableCell>
      <TableCell className='min-w-64 max-w-xl space-y-2 whitespace-normal align-top'>
        {row.issues.slice(0, 5).map((issue, index) => (
          <p key={index} className='text-xs text-destructive'>
            {issue.sheet} · {t('marketingPosts.bulkImport.rowNumber', { row: issue.rowNumber })}: {issue.message}
          </p>
        ))}
        {row.issues.length > 5 && (
          <p className='text-xs text-muted-foreground'>
            {t('marketingPosts.bulkImport.moreIssues', { count: row.issues.length - 5 })}
          </p>
        )}
        {row.channels.map((channel) => (
          <div key={channel.platform} className='space-y-1 rounded-lg border p-2'>
            <div className='flex flex-wrap items-center gap-2 text-xs'>
              <span className='font-medium'>{names[channel.platform]}</span>
              <Badge variant='outline'>{t(`marketingPosts.bulkImport.status.${channel.status}`)}</Badge>
              {channel.existing && (
                <span className='text-muted-foreground'>{t('marketingPosts.bulkImport.existing')}</span>
              )}
              {channel.externalPostUrl && (
                <a
                  href={channel.externalPostUrl}
                  target='_blank'
                  rel='noreferrer'
                  className='inline-flex items-center gap-1 text-primary underline'
                >
                  <ExternalLinkIcon className='size-3' />
                  {t('marketingPosts.bulkImport.openPublished')}
                </a>
              )}
            </div>
            {channel.errorCode && (
              <p className='text-xs text-destructive'>
                {importErrorLabel(channel.errorCode, t)}{' '}
                <span className='font-mono text-[10px] break-all'>({channel.errorCode})</span>
              </p>
            )}
            {channel.externalPostId && !channel.externalPostUrl && (
              <p className='font-mono text-xs break-all'>{channel.externalPostId}</p>
            )}
          </div>
        ))}
      </TableCell>
    </TableRow>
  )
}

export default function ImportDetail({ id }: { id: string }) {
  const { t } = useTenantTranslation()
  const [page, setPage] = useState(1)
  const query = useImportDetail(id, page)
  const download = useMutation({
    mutationFn: () => service.export(id),
    onSuccess: (blob) => {
      const url = URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = `post-import-${id}.xlsx`
      anchor.click()
      setTimeout(() => URL.revokeObjectURL(url), 0)
    },
    onError: (error) => toast.error(importRequestError(error, t))
  })
  const detail = query.data
  if (query.isLoading) return <Skeleton className='h-32 w-full' />
  if (!detail)
    return (
      <div role='alert' className='flex flex-wrap items-center gap-3 text-sm text-destructive'>
        {t('marketingPosts.bulkImport.error.loadDetail')}
        <Button size='sm' variant='outline' onClick={() => query.refetch()}>
          {t('marketingPosts.bulkImport.refresh')}
        </Button>
      </div>
    )
  const batch = detail.batch
  const stats = [
    ['rows', `${batch.processedRows}/${batch.totalRows}`],
    ['succeeded', batch.succeeded],
    ['scheduled', batch.scheduled],
    ['pending', batch.pending],
    ['failed', batch.failed],
    ['review', batch.needsReview]
  ] as const
  return (
    <div className='space-y-4'>
      <div className='flex flex-wrap items-center justify-between gap-3'>
        <div className='min-w-0 space-y-1'>
          <p className='text-sm font-medium break-all'>{batch.fileName}</p>
          <Badge variant='outline'>{t(`marketingPosts.bulkImport.status.${batch.status}`)}</Badge>
        </div>
        <div className='flex flex-wrap gap-2'>
          <Button type='button' size='sm' variant='outline' disabled={query.isFetching} onClick={() => query.refetch()}>
            {query.isFetching ? <Spinner /> : <RefreshCwIcon />}
            {t('marketingPosts.bulkImport.refresh')}
          </Button>
          <Button
            type='button'
            size='sm'
            variant='outline'
            disabled={download.isPending}
            onClick={() => download.mutate()}
          >
            {download.isPending ? <Spinner /> : <DownloadIcon />}
            {t('marketingPosts.bulkImport.export')}
          </Button>
        </div>
      </div>
      <div className='grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-6' aria-live='polite'>
        {stats.map(([key, value]) => (
          <div key={key} className='rounded-lg border bg-muted/20 p-3'>
            <p className='text-xs text-muted-foreground'>{t(`marketingPosts.bulkImport.metric.${key}`)}</p>
            <p className='mt-1 text-lg font-semibold tabular-nums'>{value}</p>
          </div>
        ))}
      </div>
      <p className='text-xs text-muted-foreground'>{t('marketingPosts.bulkImport.progressHint')}</p>
      {batch.invalidRows > 0 && (
        <p className='text-xs text-destructive'>
          {t('marketingPosts.bulkImport.invalidRows', { count: batch.invalidRows })}
        </p>
      )}
      {query.isError && (
        <p role='alert' className='text-xs text-destructive'>
          {t('marketingPosts.bulkImport.error.refreshDetail')}
        </p>
      )}
      {detail.issues.length > 0 && (
        <details className='rounded-lg border border-amber-300/60 p-3 text-xs'>
          <summary className='cursor-pointer font-medium'>
            {t('marketingPosts.bulkImport.fileIssues', { count: detail.issues.length })}
          </summary>
          <ul className='mt-2 space-y-1'>
            {detail.issues.slice(0, 50).map((issue, index) => (
              <li key={index}>
                {issue.sheet} · {t('marketingPosts.bulkImport.rowNumber', { row: issue.rowNumber })}: {issue.message}
              </li>
            ))}
          </ul>
          {detail.issues.length > 50 && (
            <p className='mt-2'>{t('marketingPosts.bulkImport.moreIssues', { count: detail.issues.length - 50 })}</p>
          )}
        </details>
      )}
      <div className='overflow-x-auto rounded-xl border'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('marketingPosts.bulkImport.column.row')}</TableHead>
              <TableHead>{t('marketingPosts.bulkImport.column.post')}</TableHead>
              <TableHead>{t('marketingPosts.bulkImport.column.status')}</TableHead>
              <TableHead>{t('marketingPosts.bulkImport.column.result')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {detail.rows.map((row) => (
              <RowResult key={row.rowNumber} row={row} />
            ))}
          </TableBody>
        </Table>
      </div>
      <div className='flex items-center justify-between gap-3 text-xs text-muted-foreground'>
        <span>
          {t('marketingPosts.bulkImport.page', {
            page,
            total: Math.max(1, Math.ceil(detail.totalRows / detail.pageSize))
          })}
        </span>
        <div className='flex gap-2'>
          <Button
            type='button'
            size='icon'
            variant='outline'
            disabled={page === 1 || query.isPlaceholderData}
            onClick={() => setPage((value) => value - 1)}
            aria-label={t('marketingPosts.bulkImport.previous')}
          >
            <ChevronLeftIcon />
          </Button>
          <Button
            type='button'
            size='icon'
            variant='outline'
            disabled={page * detail.pageSize >= detail.totalRows || query.isPlaceholderData}
            onClick={() => setPage((value) => value + 1)}
            aria-label={t('marketingPosts.bulkImport.next')}
          >
            <ChevronRightIcon />
          </Button>
        </div>
      </div>
    </div>
  )
}
