import { DataTable } from '@/components/data-table/data-table'
import { DataTableToolbar } from '@/components/data-table/data-table-toolbar'
import { Button } from '@/components/ui/button'
import { getColumns } from '@/features/mentor-packages/columns/mentor-package-columns'
import CreateMentorPackageDialog from '@/features/mentor-packages/components/create-mentor-package-dialog'
import { useGetMentorPackagePinStatistics } from '@/features/mentor-packages/hooks/use-get-mentor-package-pin-statistics'
import { useGetMyMentorPackages } from '@/features/mentor-packages/hooks/use-get-my-mentor-packages'
import type { MentorPackage } from '@/features/mentor-packages/types'
import { useDataTable } from '@/hooks/use-data-table'
import { useTableQueryParams } from '@/hooks/use-table-query-params'
import type { ExtendedColumnSort } from '@/types/data-table.type'
import { PlusIcon } from 'lucide-react'
import { parseAsBoolean, parseAsString, useQueryState } from 'nuqs'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

export default function MentorPackagesPage() {
  const { t } = useTranslation()

  // DEPRECATED CODE
  // const { updateMentorPackage, isUpdatingMentorPackage } = useUpdateMentorPackage()
  // const changeSortOrder = (pkg: MentorPackage, direction: 'up' | 'down') => {
  //   const currentIndex = items.findIndex((item) => item.id === pkg.id)
  //   if (currentIndex === -1) return

  //   const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1
  //   if (newIndex < 0 || newIndex >= items.length) return

  //   const reorderedItems = [...items]
  //   const [movedItem] = reorderedItems.splice(currentIndex, 1)
  //   reorderedItems.splice(newIndex, 0, movedItem)

  //   const nextSortOrder = calculateReorderPosition(reorderedItems, newIndex)

  //   updateMentorPackage({
  //     body: {
  //       mentorPackageId: pkg.id,
  //       name: pkg.name,
  //       description: pkg.description,
  //       durationInMinutes: pkg.durationInMinutes,
  //       totalSessions: String(pkg.totalSessions),
  //       price: String(pkg.price),
  //       currency: pkg.currency,
  //       isActive: pkg.isActive,
  //       position: nextSortOrder,
  //       coverImageUrl: pkg.coverImageUrl || null
  //     }
  //   })
  // }

  const columns = useMemo(() => getColumns(), [])
  const { page, limit, sorting, sortBy, orderBy } = useTableQueryParams({
    columns,
    prefix: 'mentorPackages'
  })

  const [searchFilter] = useQueryState('mentorPackages_name', parseAsString)
  const [isPinFilter] = useQueryState('mentorPackages_isPin', parseAsBoolean)

  const search = searchFilter ?? undefined
  const isPin = isPinFilter ?? undefined

  const { pinStatistics, isLoadingPinStatistics } = useGetMentorPackagePinStatistics()
  const { mentorPackages, isLoadingMyMentorPackages } = useGetMyMentorPackages({
    pageIndex: page,
    pageSize: limit,
    sortBy: sortBy ? (orderBy === 'desc' ? `-${sortBy.toLowerCase()}` : sortBy.toLowerCase()) : '-createdonutc',
    searchTerm: search,
    isPin
  })

  const filterOptionOverrides = useMemo(() => {
    return {
      isPin: pinStatistics.value.items.map((item) => ({
        label: item.isPin ? t('mentorPackage.list.isPinned') : t('mentorPackage.list.notPinned'),
        value: String(item.isPin),
        count: item.count
      }))
    }
  }, [pinStatistics, t])

  const { table } = useDataTable({
    data: mentorPackages.value.items,
    columns,
    pageCount: Math.ceil(mentorPackages.value.totalCount / limit),
    initialState: {
      sorting: (sorting ?? [{ id: 'createdOnUtc', desc: true }]) as ExtendedColumnSort<MentorPackage>[],
      columnPinning: { right: ['actions'] }
    },
    getRowId: ({ id }) => id,
    shallow: false,
    clearOnDefault: true,
    queryKeys: {
      page: 'mentorPackages_page',
      perPage: 'mentorPackages_perPage',
      sort: 'mentorPackages_sort'
    },
    filterPrefix: 'mentorPackages'
  })

  const isLoading = isLoadingMyMentorPackages || isLoadingPinStatistics

  return (
    <div className='absolute inset-0 overflow-y-auto'>
      <div className='space-y-6 p-6'>
        <div>
          <p className='text-2xl font-bold'>{t('mentorPackage.page.title')}</p>
          <p className='text-muted-foreground text-sm'>{t('mentorPackage.page.description')}</p>
        </div>

        <DataTable table={table} isLoading={isLoading}>
          <DataTableToolbar table={table} filterOptionOverrides={filterOptionOverrides}>
            <CreateMentorPackageDialog>
              <Button size='sm'>
                <PlusIcon />
                {t('mentorPackage.list.newPackage')}
              </Button>
            </CreateMentorPackageDialog>
          </DataTableToolbar>
        </DataTable>
      </div>
    </div>
  )
}
