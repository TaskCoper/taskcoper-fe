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
import { getColumns } from '../feature/article/components/article-columns'
import { useDeleteArticles } from '../feature/article/hooks/use-delete-articles'
import { useGetArticles } from '../feature/article/hooks/use-get-articles'
import type { ArticleRow } from '../feature/article/types'

export default function NewsArticlesPage() {
  const { t } = useTenantTranslation()
  const { deleteArticle, isDeletingArticle } = useDeleteArticles()
  const { confirm } = useConfirmStore()
  const navigate = useNavigate()
  const onNavigate = () => {
    navigate('/htm/news/add')
  }

  const handleDeleteArticle = useCallback(
    async (id: string) => {
      const confirmed = await confirm({
        title: t('articles.confirm.deleteTitle'),
        description: t('articles.confirm.deleteDescription'),
        confirmText: t('common.button.delete'),
        cancelText: t('common.button.cancel'),
        variant: 'destructive'
      })
      if (!confirmed) return

      deleteArticle({ id: id })
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
        <DataTableToolbar table={table}>
          <Button size='sm' onClick={onNavigate}>
            <CirclePlus className='size-3' />
            {t('tenant.hoaTheoMua.articles.form.title')}
          </Button>
        </DataTableToolbar>
      </DataTable>
    </div>
  )
}
