import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatDateTime } from '@/lib/date'
import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { cn } from '@/shared/utils'
import ImageLightbox from '@/tenants/hoa-theo-mua/components/image-lightbox'
import type { Row } from '@tanstack/react-table'
import { ExternalLinkIcon } from 'lucide-react'
import { useState } from 'react'
import { publicationStatusBadgeClasses } from '../publications/status-badge'
import { marketingPostPlatformStatusBadgeClasses } from '../status-badge'
import {
  isPublicationChild,
  type MarketingPostListItem,
  type MarketingPostPlatformStatus,
  type MarketingPostPublicationChild
} from '../types'
import MarketingPostThumbnail from './marketing-post-thumbnail'

const headClassName = 'text-muted-foreground text-sm font-medium'

function PublicationRow({ publication }: { publication: MarketingPostPublicationChild }) {
  const { t } = useTenantTranslation()
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const [coverUrl] = publication.imageUrls

  return (
    <TableRow className='align-top text-sm'>
      <TableCell className='whitespace-nowrap font-medium'>
        {t(`marketingPosts.platform.${publication.platform}`)}
      </TableCell>

      <TableCell>
        {/* Đã có lần đăng thì là trạng thái lần đăng, chưa thì là trạng thái nền tảng (đang sinh, sẵn sàng...) */}
        {isPublicationChild(publication) ? (
          <Badge variant='outline' className={cn('font-normal', publicationStatusBadgeClasses[publication.status])}>
            {t(`marketingPosts.publication.status.${publication.status}`)}
          </Badge>
        ) : (
          <Badge
            variant='outline'
            className={cn(
              'font-normal',
              marketingPostPlatformStatusBadgeClasses[publication.status as MarketingPostPlatformStatus]
            )}
          >
            {t(`marketingPosts.platformStatus.${publication.status}`)}
          </Badge>
        )}
      </TableCell>

      <TableCell>
        {/* Ảnh đầu làm đại diện, bấm vào thì lướt được cả bộ ảnh đã đăng */}
        <MarketingPostThumbnail
          src={coverUrl ?? null}
          alt={t('marketingPosts.detail.imageAlt', { index: 1 })}
          openLabel={t('marketingPosts.detail.openImage', { index: 1 })}
          onOpen={() => setLightboxIndex(0)}
        />
        {publication.imageUrls.length > 1 && (
          <span className='mt-1 block text-xs text-muted-foreground'>
            {t('marketingPosts.detail.imageCount', { count: publication.imageUrls.length })}
          </span>
        )}
        <ImageLightbox
          slides={publication.imageUrls.map((url, index) => ({
            src: url,
            alt: t('marketingPosts.detail.imageAlt', { index: index + 1 })
          }))}
          index={lightboxIndex}
          onIndexChange={setLightboxIndex}
          label={t('marketingPosts.detail.lightbox.label')}
        />
      </TableCell>

      {/* Nội dung là bản đã đẩy lên nền tảng lúc đăng, có thể khác bản chốt hiện tại của bài */}
      <TableCell>
        <div className='max-w-120 min-w-64'>
          {publication.title && <p className='truncate font-medium'>{publication.title}</p>}
          <p className='line-clamp-2 text-xs whitespace-pre-line text-muted-foreground'>{publication.content}</p>
          {publication.hashtag && (
            <p className='mt-0.5 truncate text-xs text-sky-700 dark:text-sky-400'>{publication.hashtag}</p>
          )}
        </div>
      </TableCell>

      <TableCell className='whitespace-nowrap tabular-nums'>
        {publication.publishedAt || publication.scheduledAt ? (
          <div>
            <p className='text-xs text-muted-foreground'>
              {t(publication.publishedAt ? 'marketingPosts.column.publishedAt' : 'marketingPosts.column.scheduledAt')}
            </p>
            <time dateTime={publication.publishedAt ?? publication.scheduledAt ?? undefined}>
              {formatDateTime(publication.publishedAt ?? publication.scheduledAt, 'dateTimeShort')}
            </time>
          </div>
        ) : (
          '-'
        )}
      </TableCell>

      <TableCell className='text-right'>
        {publication.externalPostUrl ? (
          <a
            href={publication.externalPostUrl}
            target='_blank'
            rel='noreferrer'
            className='inline-flex items-center gap-1 whitespace-nowrap text-xs font-medium text-primary hover:underline'
          >
            <ExternalLinkIcon className='size-3' />
            {t('marketingPosts.publication.action.openPost')}
          </a>
        ) : (
          <span className='text-muted-foreground'>-</span>
        )}
      </TableCell>
    </TableRow>
  )
}

// Bảng con liệt kê các lần đăng của một bài, mở từ nút mũi tên ở đầu dòng
const MarketingPostPublicationsSubRow = ({ row }: { row: Row<MarketingPostListItem> }) => {
  const { t } = useTenantTranslation()
  const publications = row.original.children

  if (!publications.length) return null

  return (
    <div className='px-4 py-3'>
      <Table>
        <TableHeader>
          <TableRow className='hover:bg-transparent'>
            <TableHead className={headClassName}>{t('marketingPosts.column.platform')}</TableHead>
            <TableHead className={headClassName}>{t('marketingPosts.column.status')}</TableHead>
            <TableHead className={headClassName}>{t('marketingPosts.column.thumbnail')}</TableHead>
            <TableHead className={headClassName}>{t('marketingPosts.detail.section.content')}</TableHead>
            <TableHead className={headClassName}>{t('marketingPosts.column.publishTime')}</TableHead>
            <TableHead className={cn(headClassName, 'text-right')}>
              {t('marketingPosts.detail.field.postUrl')}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {publications.map((publication) => (
            <PublicationRow key={publication.publicationId ?? publication.platformPostId} publication={publication} />
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

export default MarketingPostPublicationsSubRow
