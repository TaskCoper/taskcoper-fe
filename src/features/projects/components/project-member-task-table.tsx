import { DataTable } from '@/components/data-table/data-table'
import { DataTableToolbar } from '@/components/data-table/data-table-toolbar'
import { useGetProjectLabelStats } from '@/features/labels/hooks/use-get-project-label-stats'
import { useGetProjectPriorityStats } from '@/features/labels/hooks/use-get-project-priority-stats'
import { useGetMilestoneStats } from '@/features/milestones/hooks/use-get-milestone-stats'
import { getColumns } from '@/features/tasks/components/columns/task-columns'
import { getTaskPriorityIcon } from '@/features/tasks/constants'
import { useDeleteTask } from '@/features/tasks/hooks/use-delete-task'
import { useGetTaskStatusStats } from '@/features/tasks/hooks/use-get-task-status-stats'
import { useGetTasks } from '@/features/tasks/hooks/use-get-tasks'
import { useDataTable } from '@/hooks/use-data-table'
import { useTableQueryParams } from '@/hooks/use-table-query-params'
import { useAuthStore } from '@/lib/zustand/auth.store'
import { useConfirmStore } from '@/lib/zustand/confirm.store'
import type { ExtendedColumnSort } from '@/types/data-table.type'
import { TaskPriorityLabel, type TaskRow } from '@/types/task.type'
import { parseAsArrayOf, parseAsBoolean, parseAsString, useQueryState } from 'nuqs'
import { useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation } from 'react-router'
import { useGetMyProjectPermissions } from '../hooks/use-get-my-project-permissions'

interface ProjectMemberTaskTableProps {
  projectIdentifier: string
  memberId?: string
  parentMilestoneIdentifier?: string
}

const DEFAULT_MEMBER_TASKS_PAGE_SIZE = 5
const MEMBER_TASKS_PAGE_SIZE_OPTIONS = [5, 10, 20, 30, 40, 50]

export default function ProjectMemberTaskTable({
  projectIdentifier,
  memberId,
  parentMilestoneIdentifier
}: ProjectMemberTaskTableProps) {
  const { t } = useTranslation()
  const location = useLocation()
  const { confirm } = useConfirmStore()
  const { user } = useAuthStore()
  const { deleteTask } = useDeleteTask({ projectIdentifier, parentMilestoneIdentifier })

  const { check } = useGetMyProjectPermissions({ projectIdentifier })
  const canToggleStatus = check('TASKS', 'canUpdate', 'canToggleTaskStatus')
  const canDelete = check('TASKS', 'canDelete')

  const onDeleteTask = useCallback(
    async (taskId: string, taskName: string) => {
      const confirmed = await confirm({
        title: t('task.deleteTask.title'),
        description: t('task.deleteTask.description', { taskName }),
        confirmText: t('task.deleteTask.confirmText'),
        cancelText: t('common.button.cancel'),
        variant: 'destructive'
      })
      if (confirmed) {
        deleteTask({ taskId })
      }
    },
    [confirm, deleteTask, t]
  )

  const taskDetailBasePath = parentMilestoneIdentifier
    ? `/projects/${projectIdentifier}/milestones/${parentMilestoneIdentifier}/tasks`
    : undefined

  const columns = useMemo(
    () =>
      getColumns({
        projectIdentifier,
        parentMilestoneIdentifier,
        onDeleteTask,
        userId: user?.UserId,
        searchParams: location.search,
        taskDetailBasePath,
        enableMemberFilter: false,
        canToggleStatus,
        canDelete
      }),
    [
      projectIdentifier,
      parentMilestoneIdentifier,
      onDeleteTask,
      user?.UserId,
      location.search,
      taskDetailBasePath,
      canToggleStatus,
      canDelete
    ]
  )

  const { page, limit, sorting, sortBy, orderBy } = useTableQueryParams({
    columns,
    prefix: 'tasks',
    limit: DEFAULT_MEMBER_TASKS_PAGE_SIZE
  })

  const { labelStats, isLoadingLabelStats } = useGetProjectLabelStats({ projectIdentifier, parentMilestoneIdentifier })
  const { milestoneStats, isLoadingMilestoneStats } = useGetMilestoneStats({ parentMilestoneIdentifier })
  const { taskStatusStats, isLoadingTaskStatusStats } = useGetTaskStatusStats({
    projectIdentifier,
    parentMilestoneIdentifier
  })
  const { priorityStats, isLoadingPriorityStats } = useGetProjectPriorityStats({
    projectIdentifier,
    parentMilestoneIdentifier
  })

  const [startDateFilter] = useQueryState('tasks_startDate', parseAsArrayOf(parseAsString))
  const [endDateFilter] = useQueryState('tasks_endDate', parseAsArrayOf(parseAsString))
  const [labelsFilter] = useQueryState('tasks_labels', parseAsArrayOf(parseAsString))
  const [milestonesFilter] = useQueryState('tasks_milestone', parseAsArrayOf(parseAsString))
  const [isCompletedFilter] = useQueryState('tasks_isCompleted', parseAsBoolean)
  const [nameFilter] = useQueryState('tasks_name', parseAsString)
  const [prioritiesFilter] = useQueryState('tasks_priority', parseAsArrayOf(parseAsString))
  const [isWatchingTaskFilter] = useQueryState('tasks_isWatchingTask', parseAsBoolean)

  const labels = labelsFilter && labelsFilter.length > 0 ? labelsFilter : undefined
  const milestones = milestonesFilter && milestonesFilter.length > 0 ? milestonesFilter : undefined
  const endDate = endDateFilter && endDateFilter.length > 1 ? endDateFilter : undefined
  const startDate = startDateFilter && startDateFilter.length > 1 ? startDateFilter : undefined
  const isCompleted = isCompletedFilter ?? undefined
  const name = nameFilter ?? undefined
  const priorities =
    prioritiesFilter && prioritiesFilter.length > 0 ? prioritiesFilter.map((p) => (p === 'null' ? null : p)) : undefined
  const isWatchingTask = isWatchingTaskFilter ?? undefined

  const { tasks, isLoadingTasks } = useGetTasks({
    parentMilestoneIdentifier,
    pageIndex: page,
    pageSize: limit,
    sortBy: sortBy ? (orderBy === 'desc' ? `-${sortBy.toLowerCase()}` : sortBy.toLowerCase()) : undefined,
    labelIds: labels,
    milestoneIds: milestones,
    endDate,
    startDate,
    isCompleted,
    name,
    memberIds: memberId ? [memberId] : undefined,
    priorities,
    isWatchingTask,
    enabled: !!memberId
  })

  const filterOptionOverrides = useMemo(() => {
    return {
      milestone:
        milestoneStats?.value?.items.map((milestone) => ({
          value: milestone.id,
          label: milestone.name,
          count: `${milestone.completedTaskCount}/${milestone.taskCount}`
        })) ?? [],
      labels:
        labelStats?.value?.items.map((label) => ({
          value: label.id,
          label: label.name,
          count: label.taskCount
        })) ?? [],
      isCompleted:
        taskStatusStats?.value?.items.map((status) => ({
          value: String(status.isCompleted),
          label: status.isCompleted ? t('task.status.completed') : t('task.status.notCompleted'),
          count: status.totalTasks
        })) ?? [],
      priority:
        priorityStats?.value?.items.map((priority) => ({
          value: priority.priority ?? 'null',
          label: priority.priority ? (
            <div className='flex items-center gap-1'>
              {getTaskPriorityIcon()[priority.priority]}
              <p>{t(TaskPriorityLabel[priority.priority])}</p>
            </div>
          ) : (
            t('task.column.none')
          ),
          count: priority.totalTasks
        })) ?? [],
      isWatchingTask: [
        { value: 'true', label: t('task.column.watching') },
        { value: 'false', label: t('task.column.notWatching') }
      ]
    }
  }, [labelStats, milestoneStats, taskStatusStats, priorityStats, t])

  const { table } = useDataTable({
    data: tasks.value.items,
    columns,
    pageCount: Math.ceil(tasks.value.totalCount / limit),
    initialState: {
      sorting: (sorting ?? []) as ExtendedColumnSort<TaskRow>[],
      pagination: {
        pageSize: DEFAULT_MEMBER_TASKS_PAGE_SIZE,
        pageIndex: 0
      },
      columnPinning: { right: ['actions'] },
      columnVisibility: {
        domainId: false,
        select: false,
        members: false,
        isWatchingTask: false,
        stats: false
      }
    },
    getRowId: ({ id }) => id,
    shallow: false,
    clearOnDefault: true,
    queryKeys: {
      page: 'tasks_page',
      perPage: 'tasks_perPage',
      sort: 'tasks_sort'
    },
    filterPrefix: 'tasks'
  })

  const isLoading =
    isLoadingTasks ||
    isLoadingLabelStats ||
    isLoadingMilestoneStats ||
    isLoadingTaskStatusStats ||
    isLoadingPriorityStats

  return (
    <div className='space-y-2'>
      <div>
        <p className='font-semibold'>{t('project.memberTaskTable.title')}</p>
        <p className='text-xs text-muted-foreground'>{t('project.memberTaskTable.description')}</p>
      </div>

      <DataTable table={table} isLoading={isLoading} pageSizeOptions={MEMBER_TASKS_PAGE_SIZE_OPTIONS}>
        <DataTableToolbar table={table} filterOptionOverrides={filterOptionOverrides} />
      </DataTable>
    </div>
  )
}
