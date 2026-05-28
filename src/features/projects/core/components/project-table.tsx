import { DataTable } from '@/components/data-table/data-table'
import { DataTableToolbar } from '@/components/data-table/data-table-toolbar'
import { Button } from '@/components/ui/button'
import { useGetMe } from '@/features/auth/hooks/use-get-me'
import { useDataTable } from '@/hooks/use-data-table'
import { useTableQueryParams } from '@/hooks/use-table-query-params'
import { useConfirmStore } from '@/lib/zustand/confirm.store'
import type { ExtendedColumnSort } from '@/types/data-table.type'
import { PlusCircleIcon } from 'lucide-react'
import { parseAsArrayOf, parseAsBoolean, parseAsString, useQueryState } from 'nuqs'
import { useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation } from 'react-router'
import { useGetProjectLabelStats } from '../../analytics/hooks/use-get-project-label-stats'
import { useGetProjectMemberStats } from '../../analytics/hooks/use-get-project-member-stats'
import { useGetProjectPriorityStats } from '../../analytics/hooks/use-get-project-priority-stats'
import { useGetTaskStatusStats } from '../../analytics/hooks/use-get-task-status-stats'
import AddMilestonePopover from '../../milestones/components/add-milestone-popover'
import { useGetMilestoneStats } from '../../milestones/hooks/use-get-milestone-stats'
import { useGetMyProjectPermissions } from '../../roles/hooks/use-get-my-project-permissions'
import AddTaskPopover from '../../tasks/core/components/add-task-popover'
import { getTaskPriorityIcon } from '../../tasks/core/constants'
import { useDeleteTask } from '../../tasks/core/hooks/use-delete-task'
import { useGetTasks } from '../../tasks/core/hooks/use-get-tasks'
import { TaskPriorityLabel, type TaskRow } from '../../tasks/core/types'
import { getColumns } from './task-columns'

interface ProjectTableProps {
  projectIdentifier: string
  parentMilestoneIdentifier: string
}

export default function ProjectTable({ projectIdentifier, parentMilestoneIdentifier }: ProjectTableProps) {
  const { t } = useTranslation()
  const location = useLocation()
  const { confirm } = useConfirmStore()
  const { me: user } = useGetMe()
  const { deleteTask } = useDeleteTask({ projectIdentifier, parentMilestoneIdentifier })

  const { check } = useGetMyProjectPermissions({ projectIdentifier })
  const canWrite = check('TASKS', 'canWrite')
  const canToggleStatus = check('TASKS', 'canUpdate', 'canToggleTaskStatus')
  const canDelete = check('TASKS', 'canDelete')

  const onDeleteTask = useCallback(
    async (taskIdentifier: string, taskName: string) => {
      const confirmed = await confirm({
        title: t('task.deleteTask.title'),
        description: t('task.deleteTask.description', { taskName }),
        confirmText: t('task.deleteTask.confirmText'),
        cancelText: t('common.button.cancel'),
        variant: 'destructive'
      })
      if (confirmed) {
        deleteTask({ taskIdentifier })
      }
    },
    [confirm, deleteTask, t]
  )

  const columns = useMemo(
    () =>
      getColumns({
        projectIdentifier,
        parentMilestoneIdentifier,
        onDeleteTask,
        userId: user?.id,
        searchParams: location.search,
        canToggleStatus,
        canDelete
      }),
    [projectIdentifier, parentMilestoneIdentifier, onDeleteTask, user?.id, location.search, canToggleStatus, canDelete]
  )
  const { page, limit, sorting, sortBy, orderBy } = useTableQueryParams({
    columns,
    prefix: 'tasks'
  })

  const { labelStats, isLoadingLabelStats } = useGetProjectLabelStats({ projectIdentifier, parentMilestoneIdentifier })
  const { milestoneStats, isLoadingMilestoneStats } = useGetMilestoneStats({ parentMilestoneIdentifier })
  const { taskStatusStats, isLoadingTaskStatusStats } = useGetTaskStatusStats({
    projectIdentifier,
    parentMilestoneIdentifier
  })
  const { projectMemberStats, isLoadingProjectMemberStats } = useGetProjectMemberStats({
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
  const [membersFilter] = useQueryState('tasks_memberId', parseAsArrayOf(parseAsString))
  const [prioritiesFilter] = useQueryState('tasks_priority', parseAsArrayOf(parseAsString))
  const [isWatchingTaskFilter] = useQueryState('tasks_isWatchingTask', parseAsBoolean)

  const labels = labelsFilter && labelsFilter.length > 0 ? labelsFilter : undefined
  const milestones = milestonesFilter && milestonesFilter.length > 0 ? milestonesFilter : undefined
  const endDate = endDateFilter && endDateFilter.length > 1 ? endDateFilter : undefined
  const startDate = startDateFilter && startDateFilter.length > 1 ? startDateFilter : undefined
  const isCompleted = isCompletedFilter ?? undefined
  const name = nameFilter ?? undefined
  const memberIds = membersFilter && membersFilter.length > 0 ? membersFilter : undefined
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
    memberIds,
    priorities,
    isWatchingTask
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
      memberId:
        projectMemberStats?.value?.items.map((member) => ({
          value: member.userId,
          label: `${member.firstName} ${member.lastName}`,
          count: member.totalTasks
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
  }, [labelStats, milestoneStats, taskStatusStats, projectMemberStats, priorityStats, t])

  const { table } = useDataTable({
    data: tasks.value.items,
    columns,
    pageCount: Math.ceil(tasks.value.totalCount / limit),
    initialState: {
      sorting: (sorting ?? []) as ExtendedColumnSort<TaskRow>[],
      columnPinning: { right: ['actions'] },
      columnVisibility: {
        domainId: false,
        memberIds: false
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
    isLoadingProjectMemberStats ||
    isLoadingPriorityStats

  return (
    <div className='pb-24'>
      <DataTable table={table} isLoading={isLoading}>
        <DataTableToolbar table={table} filterOptionOverrides={filterOptionOverrides}>
          {canWrite ? (
            <>
              <AddTaskPopover
                projectIdentifier={projectIdentifier}
                parentMilestoneIdentifier={parentMilestoneIdentifier}
              >
                <Button size='sm'>
                  <PlusCircleIcon />
                  {t('task.table.addCard')}
                </Button>
              </AddTaskPopover>
              <AddMilestonePopover
                projectIdentifier={projectIdentifier}
                parentMilestoneIdentifier={parentMilestoneIdentifier}
              >
                <Button size='sm'>
                  <PlusCircleIcon />
                  {t('task.table.addList')}
                </Button>
              </AddMilestonePopover>
            </>
          ) : null}
        </DataTableToolbar>
      </DataTable>
    </div>
  )
}
