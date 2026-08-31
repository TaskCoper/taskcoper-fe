import type { QueryClient } from '@tanstack/react-query'
import { queryKeys } from './query-keys'

// Composed cache-invalidation helpers for the recurring fan-out patterns in
// task/milestone/project-resource mutations. Each helper takes a small scope
// object with the IDs available at the call site and handles undefined values
// gracefully, so callers can pass everything they have without local guards.

export interface TaskScope {
  taskId?: string
  projectIdentifier?: string
  parentMilestoneIdentifier?: string
  userId?: string
}

/**
 * Refreshes every cached query downstream of a mutation that touched a task:
 * - the task itself + its comments/subtasks/attachments/members (one prefix -
 *   they all nest under tasks.detail(id) in the hierarchical key shape)
 * - the containing milestone's task list and the milestone-grouped view
 * - the "my assigned tasks" panel for the current user
 *
 * Stat queries (task-status-stats, priority-stats, member-stats, label-stats)
 * are intentionally NOT included - they're selectively invalidated inline by
 * each mutation depending on what actually changed.
 */
export function invalidateTaskTree(qc: QueryClient, scope: TaskScope) {
  const { taskId, projectIdentifier, parentMilestoneIdentifier, userId } = scope

  if (taskId) {
    qc.invalidateQueries({ queryKey: queryKeys.tasks.detail(taskId) })
  }
  if (parentMilestoneIdentifier) {
    qc.invalidateQueries({ queryKey: queryKeys.tasks.listParent(parentMilestoneIdentifier) })
    qc.invalidateQueries({
      queryKey: queryKeys.milestones.byParent(projectIdentifier, parentMilestoneIdentifier)
    })
  }
  if (projectIdentifier && userId) {
    qc.invalidateQueries({ queryKey: queryKeys.tasks.myAssigned(projectIdentifier, userId) })
  }
}

export interface MilestoneScope {
  projectIdentifier?: string
  parentMilestoneIdentifier?: string
}

/**
 * Refreshes the milestone tree below a parent: the milestone-grouped view,
 * child milestones, milestone stats, and the parent's task list. Used by
 * add/update/delete milestone mutations.
 */
export function invalidateMilestoneTree(qc: QueryClient, scope: MilestoneScope) {
  const { projectIdentifier, parentMilestoneIdentifier } = scope
  if (!parentMilestoneIdentifier) return

  qc.invalidateQueries({ queryKey: queryKeys.milestones.byParent(projectIdentifier, parentMilestoneIdentifier) })
  qc.invalidateQueries({ queryKey: queryKeys.milestones.childMilestones(parentMilestoneIdentifier) })
  qc.invalidateQueries({ queryKey: queryKeys.milestones.stats(parentMilestoneIdentifier) })
  qc.invalidateQueries({ queryKey: queryKeys.tasks.listParent(parentMilestoneIdentifier) })
}

/**
 * Refreshes the project-resource family: the resource list plus the three
 * resource-related project stats. Used by upload/delete-attachment and direct
 * project-resource mutations.
 */
export function invalidateProjectResources(qc: QueryClient, projectIdentifier?: string) {
  if (!projectIdentifier) return
  qc.invalidateQueries({ queryKey: queryKeys.projects.resources.all(projectIdentifier) })
  qc.invalidateQueries({ queryKey: queryKeys.projects.resourceStats(projectIdentifier) })
  qc.invalidateQueries({ queryKey: queryKeys.projects.mimeTypeStats(projectIdentifier) })
  qc.invalidateQueries({ queryKey: queryKeys.projects.resourceMemberStats(projectIdentifier) })
}
