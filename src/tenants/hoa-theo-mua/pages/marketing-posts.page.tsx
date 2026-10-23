import { DataTable } from '@/components/data-table/data-table'
import { DataTableToolbar } from '@/components/data-table/data-table-toolbar'
import { Button } from '@/components/ui/button'
import { useDataTable } from '@/hooks/use-data-table'
import { useTableQueryParams } from '@/hooks/use-table-query-params'
import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { FileSpreadsheetIcon, PlusCircleIcon } from 'lucide-react'
import { parseAsString, useQueryState } from 'nuqs'
import { useMemo, useState } from 'react'
import { Link } from 'react-router'
import { HOA_THEO_MUA_ROUTE_PREFIX } from '../config'
import { getMarketingPostColumns } from '../features/marketing-posts/components/marketing-post-columns'
import MarketingPostPublicationsSubRow from '../features/marketing-posts/components/marketing-post-publications-sub-row'
import { useDeleteMarketingPost } from '../features/marketing-posts/hooks/use-delete-marketing-post'
import { useGetMarketingPosts } from '../features/marketing-posts/hooks/use-get-marketing-posts'
import { PublicationStatus } from '../features/marketing-posts/publications/types'
import { MarketingPostPlatform } from '../features/marketing-posts/types'
import ImportDialog from '../features/marketing-posts/imports/components/import-dialog'
import ImportHistory from '../features/marketing-posts/imports/components/import-history'

const FILTER_PREFIX = 'marketingPosts'

const resolvePlatform = (value: string | null) =>
  Object.values(MarketingPostPlatform).find((platform) => platform === value)

const resolveStatus = (value: string | null) => Object.values(PublicationStatus).find((status) => status === value)

export default function MarketingPostsPage() {
  const { t } = useTenantTranslation()
  const [importOpen, setImportOpen] = useState(false)

  const { deleteMarketingPost, isDeletingMarketingPost } = useDeleteMarketingPost()

  const columns = useMemo(
    () => getMarketingPostColumns({ t, onDeleteMarketingPost: deleteMarketingPost, isDeletingMarketingPost }),
    [t, deleteMarketingPost, isDeletingMarketingPost]
  )
  const { page, limit } = useTableQueryParams({ columns, prefix: FILTER_PREFIX })
  const [searchFilter] = useQueryState(`${FILTER_PREFIX}_title`, parseAsString)
  const [platformFilter] = useQueryState(`${FILTER_PREFIX}_platform`, parseAsString)
  const [statusFilter] = useQueryState(`${FILTER_PREFIX}_status`, parseAsString)

  const { marketingPosts, isGettingMarketingPosts } = useGetMarketingPosts({
    pageIndex: page,
    pageSize: limit,
    keyword: searchFilter?.trim() || undefined,
    platform: resolvePlatform(platformFilter),
    status: resolveStatus(statusFilter)
  })

  const { table } = useDataTable({
    data: marketingPosts?.items ?? [],
    columns,
    pageCount: Math.ceil((marketingPosts?.totalCount ?? 0) / limit) || 1,
    initialState: {
      // Cột trạng thái chỉ để dựng ô lọc, trạng thái từng lần đăng đã hiện trong bảng con
      columnVisibility: { status: false },
      columnPinning: { right: ['actions'] }
    },
    getRowId: (row) => row.basePostId,
    shallow: false,
    clearOnDefault: true,
    filterPrefix: FILTER_PREFIX,
    queryKeys: {
      page: `${FILTER_PREFIX}_page`,
      perPage: `${FILTER_PREFIX}_perPage`,
      sort: `${FILTER_PREFIX}_sort`
    }
  })

  return (
    <div className='h-full overflow-auto'>
      <div className='space-y-6 p-6'>
        <div>
          <h1 className='text-2xl font-bold'>{t('marketingPosts.title')}</h1>
          <p className='text-sm text-muted-foreground'>{t('marketingPosts.description')}</p>
        </div>

        <ImportHistory />
        <DataTable
          table={table}
          isLoading={isGettingMarketingPosts}
          renderSubComponent={({ row }) => <MarketingPostPublicationsSubRow row={row} />}
        >
          <DataTableToolbar table={table}>
            <Button type='button' size='sm' variant='outline' onClick={() => setImportOpen(true)}>
              <FileSpreadsheetIcon />
              {t('marketingPosts.bulkImport.title')}
            </Button>
            <Button asChild size='sm'>
              <Link to={`/${HOA_THEO_MUA_ROUTE_PREFIX}/ai-marketing/posts/create`}>
                <PlusCircleIcon />
                {t('marketingPosts.action.create')}
              </Link>
            </Button>
          </DataTableToolbar>
        </DataTable>
        <ImportDialog open={importOpen} onOpenChange={setImportOpen} />
      </div>
    </div>
  )
}
