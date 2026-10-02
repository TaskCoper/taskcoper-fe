import { DataTable } from '@/components/data-table/data-table'
import { DataTableToolbar } from '@/components/data-table/data-table-toolbar'
import { useDataTable } from '@/hooks/use-data-table'
import { useTableQueryParams } from '@/hooks/use-table-query-params'
import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { parseAsString, useQueryState } from 'nuqs'
import { useMemo, useState } from 'react'
import Lightbox from 'yet-another-react-lightbox'
import 'yet-another-react-lightbox/styles.css'
import { getAiCardHistoryColumns } from '../features/ai-custom/components/ai-card-history-columns'
import { useDownloadAiCard } from '../features/ai-custom/hooks/use-download-ai-card'
import { useGetAiCardSizes } from '../features/ai-custom/hooks/use-get-ai-card-sizes'
import { useGetAiCardHistory } from '../features/ai-custom/hooks/use-get-ai-card-history'
import { AiCardWritingMode, type GeneratedCardHistoryItem } from '../features/ai-custom/types'

const FILTER_PREFIX = 'aiCards'

const resolveFormType = (value: string | null) => {
  if (value === AiCardWritingMode.Calligraphy || value === AiCardWritingMode.GoMay) return value

  return undefined
}

export default function AiCardsPage() {
  const { t } = useTenantTranslation()
  const [previewCard, setPreviewCard] = useState<GeneratedCardHistoryItem | null>(null)
  const { downloadAiCard, downloadingAiCardId } = useDownloadAiCard()
  const { aiCardSizes } = useGetAiCardSizes()

  const columns = useMemo(
    () =>
      getAiCardHistoryColumns({
        t,
        onPreview: setPreviewCard,
        onDownload: downloadAiCard,
        downloadingCardId: downloadingAiCardId,
        sizeOptions: aiCardSizes ?? []
      }),
    [aiCardSizes, downloadAiCard, downloadingAiCardId, t]
  )
  const { page, limit } = useTableQueryParams({ columns, prefix: FILTER_PREFIX })
  const [searchFilter] = useQueryState(`${FILTER_PREFIX}_search`, parseAsString)
  const [sizeFilter] = useQueryState(`${FILTER_PREFIX}_size`, parseAsString)
  const [formTypeFilter] = useQueryState(`${FILTER_PREFIX}_formType`, parseAsString)

  const { aiCardHistory, isGettingAiCardHistory } = useGetAiCardHistory({
    pageIndex: page,
    pageSize: limit,
    cardTemplateName: searchFilter?.trim() || undefined,
    size: sizeFilter || undefined,
    formType: resolveFormType(formTypeFilter)
  })

  const { table } = useDataTable({
    data: aiCardHistory?.items ?? [],
    columns,
    pageCount: Math.ceil((aiCardHistory?.totalCount ?? 0) / limit) || 1,
    initialState: {
      columnPinning: { right: ['actions'] }
    },
    getRowId: (row) => row.historyId,
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
          <h1 className='text-2xl font-bold'>{t('aiCustom.history.title')}</h1>
          <p className='text-sm text-muted-foreground'>{t('aiCustom.history.description')}</p>
        </div>

        <DataTable table={table} isLoading={isGettingAiCardHistory}>
          <DataTableToolbar table={table} />
        </DataTable>
      </div>

      {previewCard?.imageUrl && (
        <Lightbox
          open
          close={() => setPreviewCard(null)}
          slides={[
            {
              src: previewCard.imageUrl,
              alt: t('aiCustom.history.previewAlt', { code: previewCard.generatedCardId })
            }
          ]}
          carousel={{ finite: true }}
          render={{ buttonPrev: () => null, buttonNext: () => null }}
        />
      )}
    </div>
  )
}
