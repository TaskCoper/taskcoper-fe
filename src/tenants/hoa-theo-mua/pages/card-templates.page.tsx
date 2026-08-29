import { DataTable } from '@/components/data-table/data-table'
import { DataTableToolbar } from '@/components/data-table/data-table-toolbar'
import { Button } from '@/components/ui/button'
import { useDataTable } from '@/hooks/use-data-table'
import { useTableQueryParams } from '@/hooks/use-table-query-params'
import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { PlusIcon } from 'lucide-react'
import { parseAsString, useQueryState } from 'nuqs'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import Lightbox from 'yet-another-react-lightbox'
import 'yet-another-react-lightbox/styles.css'
import { getCardTemplateColumns } from '../features/card-templates/components/card-template-columns'
import { useGetCardTemplates } from '../features/card-templates/hooks/use-get-card-templates'
import type { CardTemplateListItem } from '../features/card-templates/types'

const FILTER_PREFIX = 'cardTemplates'
const PAGE_SIZE_OPTIONS = [5, 10, 20, 30, 40, 50]

export default function CardTemplatesPage() {
  const { t } = useTenantTranslation()
  const [previewTemplate, setPreviewTemplate] = useState<CardTemplateListItem | null>(null)
  const columns = useMemo(() => getCardTemplateColumns({ t, onPreview: setPreviewTemplate }), [t])
  const { page, limit } = useTableQueryParams({ columns, prefix: FILTER_PREFIX, limit: 10 })
  const [searchFilter] = useQueryState(`${FILTER_PREFIX}_search`, parseAsString)
  const [statusFilter] = useQueryState(`${FILTER_PREFIX}_isActive`, parseAsString)
  const activeStatus = statusFilter === 'true' ? true : statusFilter === 'false' ? false : undefined
  const { cardTemplates, isGettingCardTemplates } = useGetCardTemplates({
    pageIndex: page,
    pageSize: limit,
    search: searchFilter?.trim() || undefined,
    isActive: activeStatus
  })

  const { table } = useDataTable({
    data: cardTemplates?.items ?? [],
    columns,
    pageCount: Math.ceil((cardTemplates?.totalCount ?? 0) / limit) || 1,
    initialState: {
      pagination: { pageIndex: 0, pageSize: 10 },
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

  return (
    <div className='h-full overflow-auto'>
      <div className='space-y-6 p-6'>
        <div>
          <h1 className='text-2xl font-bold'>{t('cardTemplates.title')}</h1>
          <p className='text-sm text-muted-foreground'>{t('cardTemplates.description')}</p>
        </div>

        <DataTable table={table} isLoading={isGettingCardTemplates} pageSizeOptions={PAGE_SIZE_OPTIONS}>
          <DataTableToolbar table={table}>
            <Button size='sm' onClick={() => toast.info(t('cardTemplates.createComingSoon'))}>
              <PlusIcon />
              {t('cardTemplates.add')}
            </Button>
          </DataTableToolbar>
        </DataTable>
      </div>

      {previewTemplate?.previewImageUrl && (
        <Lightbox
          open
          close={() => setPreviewTemplate(null)}
          slides={[
            {
              src: previewTemplate.previewImageUrl,
              alt: t('cardTemplates.previewAlt', { name: previewTemplate.name })
            }
          ]}
          carousel={{ finite: true }}
          render={{ buttonPrev: () => null, buttonNext: () => null }}
        />
      )}
    </div>
  )
}
