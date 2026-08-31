import { DataTable } from '@/components/data-table/data-table'
import { DataTableToolbar } from '@/components/data-table/data-table-toolbar'
import { Button } from '@/components/ui/button'
import { useDataTable } from '@/hooks/use-data-table'
import { useTableQueryParams } from '@/hooks/use-table-query-params'
import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { useConfirmStore } from '@/lib/zustand/confirm.store'
import type { ExtendedColumnSort } from '@/types/data-table.type'
import { CirclePlus } from 'lucide-react'
import { parseAsInteger, parseAsString, useQueryState } from 'nuqs'
import { useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router'
import { HOA_THEO_MUA_ROUTE_PREFIX } from '../config'
import { getColumns } from '../features/article/components/article-columns'
import { useDeleteArticle } from '../features/article/hooks/use-delete-article'
import { useGetArticles } from '../features/article/hooks/use-get-articles'
import type { ArticleRow } from '../features/article/types'

export default function NewsArticlesPage() {
  const { t } = useTenantTranslation()
  const { deleteArticle, isDeletingArticle } = useDeleteArticle()
  const { confirm } = useConfirmStore()

  const navigate = useNavigate()

  const onNavigate = () => {
    navigate(`/${HOA_THEO_MUA_ROUTE_PREFIX}/news/add`)
  }

  const handleDeleteArticle = useCallback(
    async (identifier: string) => {
      const confirmed = await confirm({
        title: t('articles.confirm.deleteTitle'),
        description: t('articles.confirm.deleteDescription'),
        confirmText: t('common.button.delete'),
        cancelText: t('common.button.cancel'),
        variant: 'destructive'
      })

      if (!confirmed) return

      deleteArticle({ identifier })
    },
    [confirm, deleteArticle, t]
  )

  const columns = useMemo(
    () => getColumns({ t, onDeleteArticle: handleDeleteArticle, isDeletingArticle }),
    [t, handleDeleteArticle, isDeletingArticle]
  )

  const { page, limit, sorting } = useTableQueryParams({
    columns,
    prefix: 'articles'
  })

  const [titleFilter] = useQueryState('articles_title', parseAsString)
  const title = titleFilter ?? undefined

  const [statusFilter] = useQueryState('articles_status', parseAsInteger)
  const statusLine = statusFilter ?? undefined

  const { articles, isLoadingArticles } = useGetArticles({
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

  const isLoading = isLoadingArticles

  return (
    <div className='space-y-6 p-6'>
      <div className='flex justify-between items-center gap-4'>
        <div>
          <p className='text-2xl font-bold'>{t('articles.page.title')}</p>
          <p className='text-sm text-muted-foreground'>{t('articles.page.description')}</p>
        </div>
      </div>

      <DataTable table={table} isLoading={isLoading}>
        <DataTableToolbar table={table}>
          <Button size='sm' onClick={onNavigate}>
            <CirclePlus className='size-3' />
            {t('articles.form.title')}
          </Button>
        </DataTableToolbar>
      </DataTable>
    </div>
  )
}
