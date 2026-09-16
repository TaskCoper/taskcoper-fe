import { DataTable } from '@/components/data-table/data-table'
import { DataTableToolbar } from '@/components/data-table/data-table-toolbar'
import { Button } from '@/components/ui/button'
import { useDataTable } from '@/hooks/use-data-table'
import { useTableQueryParams } from '@/hooks/use-table-query-params'
import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { useConfirmStore } from '@/lib/zustand/confirm.store'
import { PlusIcon } from 'lucide-react'
import { parseAsString, useQueryState } from 'nuqs'
import { useCallback, useEffect, useMemo, useState } from 'react'
import Lightbox from 'yet-another-react-lightbox'
import 'yet-another-react-lightbox/styles.css'
import { getCardTemplateColumns } from '../features/card-templates/components/card-template-columns'
import CreateCardTemplateDialog from '../features/card-templates/components/create-card-template-dialog'
import UpdateCardTemplateDialog from '../features/card-templates/components/update-card-template-dialog'
import { useChangeCardTemplateStatus } from '../features/card-templates/hooks/use-change-card-template-status'
import { useDeleteCardTemplate } from '../features/card-templates/hooks/use-delete-card-template'
import { useGetCardTemplates } from '../features/card-templates/hooks/use-get-card-templates'
import { isCardTemplateType, type CardTemplateListItem, type CardTemplateType } from '../features/card-templates/types'

const FILTER_PREFIX = 'cardTemplates'
const PAGE_SIZE_OPTIONS = [5, 10, 20, 30, 40, 50]

const resolveTemplateType = (value: string | null): CardTemplateType | undefined => {
  return isCardTemplateType(value) ? value : undefined
}

export default function CardTemplatesPage() {
  const { t } = useTenantTranslation()
  const { confirm } = useConfirmStore()
  const { changeCardTemplateStatus } = useChangeCardTemplateStatus()
  const { deleteCardTemplate } = useDeleteCardTemplate()
  const [previewTemplate, setPreviewTemplate] = useState<CardTemplateListItem | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<CardTemplateListItem | null>(null)
  const handleToggleStatus = useCallback(
    async (template: CardTemplateListItem) => {
      const isActive = !template.isActive
      const action = isActive ? 'activate' : 'deactivate'
      const confirmed = await confirm({
        title: t(`cardTemplates.statusAction.${action}Title`),
        description: t(`cardTemplates.statusAction.${action}Description`, { name: template.name })
      })
      if (confirmed) changeCardTemplateStatus({ id: template.id, isActive })
    },
    [changeCardTemplateStatus, confirm, t]
  )

  const handleDelete = useCallback(
    async (template: CardTemplateListItem) => {
      const confirmed = await confirm({
        title: t('cardTemplates.deleteAction.title'),
        description: t('cardTemplates.deleteAction.description'),
        variant: 'destructive'
      })
      if (confirmed) deleteCardTemplate(template.id)
    },
    [confirm, deleteCardTemplate, t]
  )
  const columns = useMemo(
    () =>
      getCardTemplateColumns({
        t,
        onPreview: setPreviewTemplate,
        onEdit: setEditingTemplate,
        onToggleStatus: handleToggleStatus,
        onDelete: handleDelete
      }),
    [handleDelete, handleToggleStatus, t]
  )
  const { page, limit } = useTableQueryParams({ columns, prefix: FILTER_PREFIX, limit: 10 })
  const [searchFilter] = useQueryState(`${FILTER_PREFIX}_search`, parseAsString)
  const [statusFilter] = useQueryState(`${FILTER_PREFIX}_isActive`, parseAsString)
  const [templateTypeFilter] = useQueryState(`${FILTER_PREFIX}_templateType`, parseAsString)
  const activeStatus = statusFilter === 'true' ? true : statusFilter === 'false' ? false : undefined
  const templateType = resolveTemplateType(templateTypeFilter)
  const { cardTemplates, isGettingCardTemplates } = useGetCardTemplates({
    pageIndex: page,
    pageSize: limit,
    search: searchFilter?.trim() || undefined,
    isActive: activeStatus,
    templateType
  })

  const { table } = useDataTable({
    data: cardTemplates?.items ?? [],
    columns,
    pageCount: Math.ceil((cardTemplates?.totalCount ?? 0) / limit) || 1,
    initialState: {
      pagination: { pageIndex: 0, pageSize: 10 },
      columnPinning: { right: ['actions'] },
      columnVisibility: { templateType: false }
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

  useEffect(() => {
    if (cardTemplates?.items.length === 0 && page > 1) table.previousPage()
  }, [cardTemplates?.items.length, page, table])

  return (
    <div className='h-full overflow-auto'>
      <div className='space-y-6 p-6'>
        <div>
          <h1 className='text-2xl font-bold'>{t('cardTemplates.title')}</h1>
          <p className='text-sm text-muted-foreground'>{t('cardTemplates.description')}</p>
        </div>

        <DataTable table={table} isLoading={isGettingCardTemplates} pageSizeOptions={PAGE_SIZE_OPTIONS}>
          <DataTableToolbar table={table}>
            <Button size='sm' onClick={() => setIsCreateDialogOpen(true)}>
              <PlusIcon />
              {t('cardTemplates.add')}
            </Button>
          </DataTableToolbar>
        </DataTable>
      </div>

      {previewTemplate?.imageUrl && (
        <Lightbox
          open
          close={() => setPreviewTemplate(null)}
          slides={[
            {
              src: previewTemplate.imageUrl,
              alt: t('cardTemplates.previewAlt', { name: previewTemplate.name })
            }
          ]}
          carousel={{ finite: true }}
          render={{ buttonPrev: () => null, buttonNext: () => null }}
        />
      )}

      <CreateCardTemplateDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onCreated={() => table.setPageIndex(0)}
      />
      <UpdateCardTemplateDialog
        template={editingTemplate}
        open={Boolean(editingTemplate)}
        onOpenChange={(open) => {
          if (!open) setEditingTemplate(null)
        }}
      />
    </div>
  )
}
