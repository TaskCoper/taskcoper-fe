import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { cn } from '@/shared/utils'
import {
  CalendarDaysIcon,
  CheckIcon,
  ChevronDownIcon,
  GaugeIcon,
  HardDriveIcon,
  InfoIcon,
  ListTodoIcon,
  MessageCircleIcon,
  MinusIcon,
  NotebookPenIcon,
  SettingsIcon,
  ShieldIcon,
  UserRoundPlusIcon,
  WalletIcon
} from 'lucide-react'
import { Fragment, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { useGetProjectRoles } from '../hooks/use-get-project-roles'
import type { ProjectRoleItem } from '../types'
import { ActionKey, ActionKeyLabel, SectionKey, SectionKeyLabel } from '../types'
import AddProjectRoleDialog from './add-project-role-dialog'

interface ProjectPermissionsTabProps {
  projectIdentifier?: string
}

const SECTION_META: Record<SectionKey, { icon: React.ReactNode }> = {
  [SectionKey.OVERVIEW]: { icon: <InfoIcon className='size-4' /> },
  [SectionKey.TASKS]: { icon: <ListTodoIcon className='size-4' /> },
  [SectionKey.PERFORMANCE]: { icon: <GaugeIcon className='size-4' /> },
  [SectionKey.CALENDAR]: { icon: <CalendarDaysIcon className='size-4' /> },
  [SectionKey.CHAT]: { icon: <MessageCircleIcon className='size-4' /> },
  [SectionKey.NOTE]: { icon: <NotebookPenIcon className='size-4' /> },
  [SectionKey.STORAGE]: { icon: <HardDriveIcon className='size-4' /> },
  [SectionKey.REVENUE]: { icon: <WalletIcon className='size-4' /> },
  [SectionKey.SETTINGS]: { icon: <SettingsIcon className='size-4' /> }
}

const ACTIONS = Object.values(ActionKey) as ActionKey[]
const COLLAPSE_ANIMATION_MS = 200

type SectionCollapseState = 'open' | 'opening' | 'closing' | 'closed'

function PermissionCell({ allowed }: { allowed: boolean }) {
  return (
    <div className='flex items-center justify-center'>
      {allowed ? (
        <div className='flex size-5 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/40'>
          <CheckIcon className='size-3 text-emerald-600 dark:text-emerald-400' />
        </div>
      ) : (
        <div className='flex size-5 items-center justify-center rounded-full bg-muted'>
          <MinusIcon className='size-3 text-muted-foreground' />
        </div>
      )}
    </div>
  )
}

function MatrixSkeleton() {
  return (
    <div className='rounded-md border overflow-hidden'>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className='w-50' />
            {Array.from({ length: 4 }).map((_, i) => (
              <TableHead key={i} className='min-w-45 p-4'>
                <div className='flex items-center gap-3'>
                  <Skeleton className='size-8 rounded-full' />
                  <div className='space-y-2'>
                    <Skeleton className='h-4 w-20' />
                    <Skeleton className='h-3 w-12' />
                  </div>
                </div>
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 5 }).map((_, i) => (
            <Fragment key={i}>
              <TableRow className='bg-muted/20'>
                <TableCell colSpan={5} className='py-3'>
                  <div className='flex items-center gap-2'>
                    <Skeleton className='size-4 rounded-md' />
                    <Skeleton className='h-4 w-24' />
                  </div>
                </TableCell>
              </TableRow>
              {Array.from({ length: 4 }).map((_, j) => (
                <TableRow key={j}>
                  <TableCell className='pl-8 py-2'>
                    <Skeleton className='h-3 w-16' />
                  </TableCell>
                  {Array.from({ length: 4 }).map((_, k) => (
                    <TableCell key={k} className='py-2'>
                      <div className='flex justify-center'>
                        <Skeleton className='size-5 rounded-full' />
                      </div>
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </Fragment>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

export default function ProjectPermissionsTab({ projectIdentifier }: ProjectPermissionsTabProps) {
  const { t } = useTranslation()
  const { projectRoles, isLoadingProjectRoles } = useGetProjectRoles({ identifier: projectIdentifier })
  const [sectionStates, setSectionStates] = useState<Record<SectionKey, SectionCollapseState>>(() =>
    Object.values(SectionKey).reduce(
      (acc, sectionKey) => {
        acc[sectionKey] = 'open'
        return acc
      },
      {} as Record<SectionKey, SectionCollapseState>
    )
  )
  const animationTimersRef = useRef<Partial<Record<SectionKey, ReturnType<typeof setTimeout>>>>({})

  const roles = useMemo(() => projectRoles?.value?.items ?? [], [projectRoles])

  useEffect(() => {
    const animationTimers = animationTimersRef.current

    return () => {
      Object.values(animationTimers).forEach((timer) => {
        if (timer) {
          clearTimeout(timer)
        }
      })
    }
  }, [])

  const toggleSection = (sectionKey: SectionKey) => {
    setSectionStates((prev) => {
      const current = prev[sectionKey] ?? 'open'
      return {
        ...prev,
        [sectionKey]: current === 'open' || current === 'opening' ? 'closing' : 'opening'
      }
    })

    const existingTimer = animationTimersRef.current[sectionKey]
    if (existingTimer) {
      clearTimeout(existingTimer)
    }

    animationTimersRef.current[sectionKey] = setTimeout(() => {
      setSectionStates((prev) => {
        const current = prev[sectionKey]
        if (current === 'closing') {
          return { ...prev, [sectionKey]: 'closed' }
        }

        if (current === 'opening') {
          return { ...prev, [sectionKey]: 'open' }
        }

        return prev
      })
      animationTimersRef.current[sectionKey] = undefined
    }, COLLAPSE_ANIMATION_MS)
  }

  const permissionLookupByRole = useMemo(() => {
    return roles.reduce(
      (acc, role) => {
        acc[role.id] = new Map(role.permissions.map((permission) => [permission.sectionKey, permission]))
        return acc
      },
      {} as Record<string, Map<SectionKey, ProjectRoleItem['permissions'][number]>>
    )
  }, [roles])

  return (
    <div className='space-y-6'>
      {/* Section Header */}
      <div>
        <p className='text-xl font-bold'>{t('project.settings.tabs.permissions')}</p>
        <p className='text-sm text-muted-foreground'>{t('project.settings.description')}</p>
      </div>

      {/* Master Matrix Table */}
      {isLoadingProjectRoles ? (
        <MatrixSkeleton />
      ) : roles.length === 0 ? (
        <div className='flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center'>
          <ShieldIcon className='mb-3 size-10 text-muted-foreground/40' />
          <p className='text-sm font-medium text-muted-foreground'>{t('project.permissions.noRolesDefined')}</p>
        </div>
      ) : (
        <div className='space-y-4 flex flex-col'>
          {projectIdentifier ? (
            <div className='ml-auto'>
              <AddProjectRoleDialog projectIdentifier={projectIdentifier}>
                <Button size='sm'>
                  <UserRoundPlusIcon />
                  {t('project.permissions.addRole')}
                </Button>
              </AddProjectRoleDialog>
            </div>
          ) : null}

          <div className='rounded-md border overflow-x-auto shadow-xs'>
            <Table className='min-w-200 bg-card'>
              <TableHeader>
                <TableRow className='hover:bg-transparent'>
                  {/* Top Left Empty Cell */}
                  <TableHead className='w-50 border-r bg-muted/10'></TableHead>

                  {/* Role Column Headers */}
                  {roles.map((role) => {
                    return (
                      <TableHead key={role.id} className='min-w-45 p-2 align-middle text-center'>
                        <div className='flex flex-col items-center justify-center'>
                          <Link
                            to={`/projects/${projectIdentifier}/roles/${role.id}`}
                            className='hover:underline hover:text-primary'
                          >
                            <p className='font-semibold text-center'>{role.name}</p>
                          </Link>
                          <p className='text-[11px] font-normal text-muted-foreground'>
                            {t('project.permissions.memberCount', { count: role.memberCount })}
                          </p>
                        </div>
                      </TableHead>
                    )
                  })}
                </TableRow>
              </TableHeader>

              <TableBody>
                {Object.values(SectionKey).map((sectionKey) => {
                  const meta = SECTION_META[sectionKey]
                  const sectionState = sectionStates[sectionKey] ?? 'open'
                  const isExpanded = sectionState === 'open' || sectionState === 'opening'
                  const shouldRenderActions = sectionState !== 'closed'
                  const isAnimating = sectionState === 'opening' || sectionState === 'closing'
                  const actionRowState = sectionState === 'closing' ? 'closed' : 'open'
                  const actionRowAnimationClass = isAnimating
                    ? 'overflow-hidden transition-all motion-reduce:animate-none data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down'
                    : ''

                  return (
                    <Fragment key={sectionKey}>
                      {/* Section Group Header */}
                      <TableRow className='border-y bg-muted/30 hover:bg-muted/30'>
                        <TableCell colSpan={roles.length + 1} className='py-2.5'>
                          <button
                            type='button'
                            onClick={() => toggleSection(sectionKey)}
                            className='cursor-pointer flex w-full items-center justify-between gap-2 rounded-sm px-1 text-left font-semibold text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring'
                            aria-expanded={isExpanded}
                          >
                            <span className='flex items-center gap-2'>
                              <span className='text-primary'>{meta.icon}</span>
                              {t(SectionKeyLabel[sectionKey])}
                            </span>
                            <ChevronDownIcon
                              className={cn(
                                'size-4 text-muted-foreground transition-transform duration-200',
                                isExpanded ? 'rotate-180' : ''
                              )}
                            />
                          </button>
                        </TableCell>
                      </TableRow>

                      {/* Action Rows */}
                      {shouldRenderActions &&
                        ACTIONS.map((action, actionIdx) => {
                          const isLastAction = actionIdx === ACTIONS.length - 1
                          return (
                            <TableRow
                              key={`${sectionKey}-${action}`}
                              data-state={actionRowState}
                              style={{ ['--radix-accordion-content-height' as string]: '2.5rem' }}
                              className={cn(
                                'hover:bg-muted/10',
                                actionRowAnimationClass,
                                isLastAction && sectionState !== 'closing' ? 'border-none' : ''
                              )}
                            >
                              {/* Y-Axis Label */}
                              <TableCell className='border-r bg-muted/5 py-2 pl-9 text-xs font-medium text-muted-foreground'>
                                {t(ActionKeyLabel[action])}
                              </TableCell>

                              {/* Data Cells */}
                              {roles.map((role) => {
                                const sectionPerm = permissionLookupByRole[role.id]?.get(sectionKey)
                                const isAllowed = sectionPerm ? sectionPerm[action] : false

                                return (
                                  <TableCell key={`${role.id}-${action}`} className='py-2.5'>
                                    <PermissionCell allowed={isAllowed} />
                                  </TableCell>
                                )
                              })}
                            </TableRow>
                          )
                        })}
                    </Fragment>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  )
}
