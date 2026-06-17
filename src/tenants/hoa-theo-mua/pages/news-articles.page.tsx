import { DataTable } from '@/components/data-table/data-table'
import { DataTableToolbar } from '@/components/data-table/data-table-toolbar'
import { useDataTable } from '@/hooks/use-data-table'
import { useTableQueryParams } from '@/hooks/use-table-query-params'
import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import type { ExtendedColumnSort } from '@/types/data-table.type'
import { parseAsInteger, parseAsString, useQueryState } from 'nuqs'
import { useMemo } from 'react'
import { getColumns } from '../feature/article/components/article-columns'
import { useGetArticles } from '../feature/article/hooks/use-get-articles'
import type { ArticleRow } from '../feature/article/types'

export default function NewsArticlesPage() {
  const { t } = useTenantTranslation()

  const columns = useMemo(() => getColumns({ t }), [t])

  const { page, limit, sorting } = useTableQueryParams({
    columns,
    prefix: 'articles'
  })

  const [titleFilter] = useQueryState('articles_title', parseAsString)
  const title = titleFilter ?? undefined

  const [statusFilter] = useQueryState('articles_Status', parseAsInteger)
  const statusLine = statusFilter ?? undefined
  const { articles, isLoadingArticle } = useGetArticles({
    pageIndex: page,
    pageSize: limit,
    keyword: title,
    status: statusLine
  })

  const { table } = useDataTable({
    data: articles.value.items,
    columns,
    pageCount: Math.ceil(articles.value.totalCount / limit),
    initialState: {
      sorting: (sorting ?? []) as ExtendedColumnSort<ArticleRow>[],
      columnPinning: { right: ['actions'] }
    },

    getRowId: ({ id }) => id,
    shallow: false,
    clearOnDefault: true,
    queryKeys: {
      page: 'articles_page',
      perPage: 'articles_perPage',
      sort: 'articles_sort'
    },

    filterPrefix: 'articles'
  })

  const isLoading = isLoadingArticle

  return (
    <div className='space-y-4'>
      <DataTable table={table} isLoading={isLoading} className='p-4'>
        <DataTableToolbar table={table} />
      </DataTable>
    </div>
  )
}
