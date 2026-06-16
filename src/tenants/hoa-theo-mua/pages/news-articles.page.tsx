import { DataTable } from '@/components/data-table/data-table'
import { DataTableToolbar } from '@/components/data-table/data-table-toolbar'
import { useDataTable } from '@/hooks/use-data-table'
import { useTableQueryParams } from '@/hooks/use-table-query-params'
import type { ExtendedColumnSort } from '@/types/data-table.type'
import { parseAsInteger, parseAsString, useQueryState } from 'nuqs'
import { useMemo } from 'react'
import { getColumns } from '../feature/article/components/article-columns'
import { useGetArticles } from '../feature/article/hooks/use-get-articles'
import type { ArticleRow } from '../feature/article/types'

const articleTableClassName =
  'p-4 gap-4 [&_[data-slot=table-container]]:rounded-2xl [&_[data-slot=table-head]]:h-12 [&_[data-slot=table-head]]:px-4 [&_[data-slot=table-head]]:py-3 [&_[data-slot=table-row]]:transition-colors [&_[data-slot=table-row]]:hover:bg-muted/65 [&_[data-slot=table-cell]]:px-4 [&_[data-slot=table-cell]]:py-3 [&_[data-slot=select-trigger]]:h-9 [&_[data-slot=select-trigger]]:rounded-lg [&_[data-slot=button]]:rounded-lg [&_[data-slot=button][data-size=icon]]:size-9'

const articleToolbarClassName =
  'items-stretch gap-3 rounded-2xl border bg-background/80 p-3 shadow-sm sm:items-center [&>div:first-child]:gap-3 [&>div:last-child]:gap-3 [&_[data-slot=input]]:h-9 [&_[data-slot=input]]:min-w-80 [&_[data-slot=button]]:h-9 [&_[data-slot=button]]:rounded-lg [&_[data-slot=badge]]:rounded-md [&_[data-slot=badge]]:px-2 [&_p.bg-primary]:rounded-md [&_p.bg-primary]:px-2.5 [&_p.bg-primary]:py-1'

export default function NewsArticlesPage() {
  const columns = useMemo(() => getColumns(), [])

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
      <DataTable table={table} isLoading={isLoading} className={articleTableClassName}>
        <DataTableToolbar table={table} className={articleToolbarClassName} />
      </DataTable>
    </div>
  )
}
