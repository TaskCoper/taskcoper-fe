import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Skeleton } from '@/components/ui/skeleton'
import { CheckIcon, CircleCheckIcon, LinkIcon, LoaderCircleIcon, LockKeyholeIcon, PlusIcon, XIcon } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useLocation } from 'react-router'
import { useDebounce } from 'use-debounce'
import { useDependencyCandidates, useTaskDependencies, useUpdateTaskDependency } from '../hooks'
import type { DependencyTask } from '../types'

interface Props {
  taskId: string
  projectIdentifier: string
  parentMilestoneIdentifier: string
  canUpdate: boolean
  isCompleted: boolean
}

export default function TaskDependenciesSection({
  taskId,
  projectIdentifier,
  parentMilestoneIdentifier,
  canUpdate,
  isCompleted
}: Props) {
  const { t } = useTranslation()
  const location = useLocation()
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [debouncedSearch] = useDebounce(search, 250)
  const dependencies = useTaskDependencies(taskId)
  const candidates = useDependencyCandidates(taskId, debouncedSearch, open && canUpdate && !isCompleted)
  const mutation = useUpdateTaskDependency(projectIdentifier, parentMilestoneIdentifier)
  const data = dependencies.data

  const renderTask = (task: DependencyTask, removable: boolean) => (
    <li key={task.taskId} className='flex min-w-0 items-center gap-2 rounded-lg border bg-background p-2'>
      {task.isCompleted ? (
        <CircleCheckIcon className='size-4 shrink-0 text-primary' aria-hidden />
      ) : (
        <LockKeyholeIcon className='size-4 shrink-0 text-muted-foreground' aria-hidden />
      )}
      <Link
        to={`/projects/${projectIdentifier}/milestones/${task.parentMilestoneSlug || task.parentMilestoneId}/tasks/${task.slug || task.taskId}${location.search}`}
        className='min-w-0 flex-1 break-words text-sm hover:underline focus-visible:outline-2 focus-visible:outline-ring'
      >
        {task.name}
        <span className='mt-0.5 block text-xs text-muted-foreground'>
          {task.isCompleted ? t('task.dependency.completed') : t('task.dependency.incomplete')}
        </span>
      </Link>
      {removable && canUpdate ? (
        <Button
          type='button'
          size='icon-sm'
          variant='ghost'
          disabled={mutation.isPending}
          aria-label={t('task.dependency.removeNamed', { name: task.name })}
          onClick={() => mutation.mutate({ taskId, prerequisiteId: task.taskId, remove: true })}
        >
          <XIcon aria-hidden />
        </Button>
      ) : null}
    </li>
  )

  return (
    <section className='min-w-0 space-y-3' aria-labelledby='task-dependencies-title'>
      <div className='flex flex-wrap items-center justify-between gap-2'>
        <h3 id='task-dependencies-title' className='flex items-center gap-2 text-sm font-semibold'>
          <LinkIcon className='size-4' aria-hidden />
          {t('task.dependency.title')}
        </h3>
        {canUpdate && !isCompleted ? (
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                type='button'
                variant='outline'
                size='sm'
                disabled={dependencies.isPending || dependencies.isError}
              >
                <PlusIcon aria-hidden />
                {t('task.dependency.add')}
              </Button>
            </PopoverTrigger>
            <PopoverContent align='start' className='w-80 max-w-[calc(100vw-2rem)] p-3'>
              <div className='space-y-3'>
                <p className='text-sm font-medium'>{t('task.dependency.choose')}</p>
                <Input
                  value={search}
                  maxLength={200}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder={t('task.dependency.search')}
                  aria-label={t('task.dependency.search')}
                />
                <div
                  className='max-h-64 space-y-1 overflow-y-auto'
                  aria-busy={candidates.isFetching || mutation.isPending}
                >
                  {candidates.isPending ? <Skeleton className='h-16 w-full' /> : null}
                  {candidates.isError ? (
                    <div role='alert' className='space-y-2 text-sm'>
                      <p>{t('task.dependency.loadError')}</p>
                      <Button type='button' variant='outline' size='sm' onClick={() => candidates.refetch()}>
                        {t('task.dependency.retry')}
                      </Button>
                    </div>
                  ) : null}
                  {candidates.data?.pages
                    .flatMap((page) => page.items)
                    .map((task) => (
                      <Button
                        key={task.taskId}
                        type='button'
                        variant='ghost'
                        className='h-auto w-full justify-start whitespace-normal text-left'
                        disabled={mutation.isPending || search !== debouncedSearch || candidates.isFetching}
                        onClick={() =>
                          mutation.mutate(
                            { taskId, prerequisiteId: task.taskId, remove: false },
                            {
                              onSuccess: () => {
                                setOpen(false)
                                setSearch('')
                              }
                            }
                          )
                        }
                      >
                        {task.isCompleted ? (
                          <CheckIcon className='shrink-0' aria-hidden />
                        ) : (
                          <PlusIcon className='shrink-0' aria-hidden />
                        )}
                        <span className='min-w-0 break-words'>{task.name}</span>
                      </Button>
                    ))}
                  {candidates.data?.pages[0]?.items.length === 0 ? (
                    <p className='p-2 text-sm text-muted-foreground'>{t('task.dependency.noResults')}</p>
                  ) : null}
                  {candidates.hasNextPage ? (
                    <Button
                      type='button'
                      variant='ghost'
                      className='w-full'
                      disabled={candidates.isFetchingNextPage}
                      onClick={() => candidates.fetchNextPage()}
                    >
                      {t('task.dependency.loadMore')}
                    </Button>
                  ) : null}
                </div>
              </div>
            </PopoverContent>
          </Popover>
        ) : null}
      </div>
      {dependencies.isPending ? <Skeleton className='h-20 w-full' /> : null}
      {dependencies.isError ? (
        <div role='alert' className='space-y-2 rounded-lg border p-3 text-sm'>
          <p>{t('task.dependency.loadError')}</p>
          <Button type='button' variant='outline' size='sm' onClick={() => dependencies.refetch()}>
            {t('task.dependency.retry')}
          </Button>
        </div>
      ) : null}
      {data ? (
        <>
          <div role='status' className='flex items-start gap-2 rounded-lg border bg-muted/50 p-3 text-sm'>
            {mutation.isPending ? (
              <LoaderCircleIcon className='mt-0.5 size-4 shrink-0 animate-spin' aria-hidden />
            ) : data.isBlocked ? (
              <LockKeyholeIcon className='mt-0.5 size-4 shrink-0' aria-hidden />
            ) : (
              <CircleCheckIcon className='mt-0.5 size-4 shrink-0 text-primary' aria-hidden />
            )}
            <div className='min-w-0'>
              <p className='font-medium'>
                {data.isBlocked
                  ? t('task.dependency.blocked')
                  : data.dependsOn.length
                    ? t('task.dependency.ready')
                    : t('task.dependency.empty')}
              </p>
              <p className='mt-1 text-xs text-muted-foreground'>
                {data.isBlocked ? t('task.dependency.blockedHint') : t('task.dependency.hint')}
              </p>
            </div>
          </div>
          {data.dependsOn.length ? (
            <div className='space-y-2'>
              <p className='text-xs font-medium text-muted-foreground'>{t('task.dependency.waitingFor')}</p>
              <ul className='space-y-2'>{data.dependsOn.map((task) => renderTask(task, true))}</ul>
            </div>
          ) : null}
          {data.blocks.length ? (
            <div className='space-y-2'>
              <p className='text-xs font-medium text-muted-foreground'>{t('task.dependency.blocks')}</p>
              <ul className='space-y-2'>{data.blocks.map((task) => renderTask(task, false))}</ul>
            </div>
          ) : null}
        </>
      ) : null}
    </section>
  )
}
