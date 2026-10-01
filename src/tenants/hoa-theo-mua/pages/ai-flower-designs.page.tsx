import { DataTable } from '@/components/data-table/data-table'
import { DataTableToolbar } from '@/components/data-table/data-table-toolbar'
import { useDataTable } from '@/hooks/use-data-table'
import { useTableQueryParams } from '@/hooks/use-table-query-params'
import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { parseAsArrayOf, parseAsString, useQueryState } from 'nuqs'
import { useMemo, useState } from 'react'
import ImageLightbox from '../components/image-lightbox'
import { getAiFlowerDesignHistoryColumns } from '../features/ai-custom/components/ai-flower-design-history-columns'
import { useGetAiFlowerDesignHistory } from '../features/ai-custom/hooks/use-get-ai-flower-design-history'
import type { GeneratedFlowerHistoryItem } from '../features/ai-custom/types'

const FILTER_PREFIX = 'aiFlowerDesigns'

export default function AiFlowerDesignsPage() {
  const { t } = useTenantTranslation()
  const [previewDesign, setPreviewDesign] = useState<GeneratedFlowerHistoryItem | null>(null)

  const columns = useMemo(() => getAiFlowerDesignHistoryColumns({ t, onPreview: setPreviewDesign }), [t])
  const { page, limit } = useTableQueryParams({ columns, prefix: FILTER_PREFIX })
  const [searchFilter] = useQueryState(`${FILTER_PREFIX}_search`, parseAsString)
  const [comboFilter] = useQueryState(`${FILTER_PREFIX}_comboIds`, parseAsArrayOf(parseAsString, ','))

  const { aiFlowerDesignHistory, isGettingAiFlowerDesignHistory } = useGetAiFlowerDesignHistory({
    pageIndex: page,
    pageSize: limit,
    search: searchFilter?.trim() || undefined,
    comboIds: comboFilter?.length ? comboFilter : undefined
  })

  const { table } = useDataTable({
    data: aiFlowerDesignHistory?.items ?? [],
    columns,
    pageCount: Math.ceil((aiFlowerDesignHistory?.totalCount ?? 0) / limit) || 1,
    initialState: {
      columnPinning: { right: ['actions'] }
    },
    getRowId: (row) => row.id,
    shallow: false,
    clearOnDefault: true,
    filterPrefix: FILTER_PREFIX,
    queryKeys: {
      page: `${FILTER_PREFIX}_page`,
      perPage: `${FILTER_PREFIX}_perPage`,
      sort: `${FILTER_PREFIX}_sort`
    }
  })

  const previewSlides = previewDesign?.imageUrl
    ? [{ src: previewDesign.imageUrl, alt: t('aiCustom.flowerHistory.previewAlt', { code: previewDesign.id }) }]
    : []

  return (
    <div className='h-full overflow-auto'>
      <div className='space-y-6 p-6'>
        <div>
          <h1 className='text-2xl font-bold'>{t('aiCustom.flowerHistory.title')}</h1>
          <p className='text-sm text-muted-foreground'>{t('aiCustom.flowerHistory.description')}</p>
        </div>

        <DataTable table={table} isLoading={isGettingAiFlowerDesignHistory}>
          <DataTableToolbar table={table} />
        </DataTable>
      </div>

      <ImageLightbox
        slides={previewSlides}
        index={previewSlides.length > 0 ? 0 : null}
        onIndexChange={(index) => index === null && setPreviewDesign(null)}
        label={t('aiCustom.flowerDetail.lightbox.label')}
        gallery={t('aiCustom.flowerDetail.lightbox.gallery')}
      />
    </div>
  )
}
