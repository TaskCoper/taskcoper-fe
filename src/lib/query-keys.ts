import type { GetProjectTaskStatsParams } from '@/features/charts/hooks/use-get-project-task-stats'
import type { GetProjectHeatmapParams } from '@/features/projects/hooks/use-get-project-heatmap'
import type { UseGetProjectResourcesParams } from '@/features/projects/hooks/use-get-project-resources'
import type { GetProjectsParams } from '@/features/projects/hooks/use-get-projects'
import type { UseGetTasksParams } from '@/features/tasks/hooks/use-get-tasks'
import type { GetUsersParams } from '@/features/users/hooks/use-get-users'

export const queryKeys = {
  // Auth
  auth: {
    all: ['auth'] as const,
    me: () => ['me'] as const
  },
  // Users
  users: {
    all: ['users'] as const,
    list: ({ searchTerm, pageIndex, pageSize, sortBy, organizationId, domainId, roles }: GetUsersParams) =>
      [...queryKeys.users.all, searchTerm, pageIndex, pageSize, sortBy, organizationId, domainId, roles] as const
  },
  // Projects
  projects: {
    all: ['projects'] as const,
    allMy: ['my-projects'] as const,
    list: ({
      searchTerm,
      pageIndex,
      pageSize,
      startDate,
      endDate,
      organizationId,
      domainId,
      sortBy
    }: GetProjectsParams) =>
      [
        ...queryKeys.projects.all,
        searchTerm,
        pageIndex,
        pageSize,
        startDate,
        endDate,
        organizationId,
        domainId,
        sortBy
      ] as const,
    listMy: (userId?: string, status?: string[], searchTerm?: string, pageIndex?: number, pageSize?: number) =>
      [...queryKeys.projects.allMy, userId, status, searchTerm, pageIndex, pageSize] as const,
    detail: (projectId?: string) => ['project', projectId] as const,
    members: {
      all: (projectId?: string) => ['members', projectId] as const,
      list: (projectId?: string, searchTerm?: string) => ['members', projectId, searchTerm] as const
    },
    parentMilestones: (projectId?: string) => ['parent-milestones', projectId] as const,
    labels: (projectId?: string) => ['project-labels', projectId],
    labelStatsAll: (projectId: string) => ['project-label-stats', projectId],
    labelStats: (projectId: string, parentMilestoneId?: string) => [
      ...queryKeys.projects.labelStatsAll(projectId),
      parentMilestoneId
    ],
    taskStatusStats: (projectId: string, parentMilestoneId?: string) => [
      'project-task-status-stats',
      projectId,
      parentMilestoneId
    ],
    memberStats: (projectId: string, parentMilestoneId?: string) => [
      'project-member-stats',
      projectId,
      parentMilestoneId
    ],
    resourceStats: (projectId?: string) => ['project-resource-stats', projectId] as const,
    mimeTypeStats: (projectId?: string) => ['project-mime-type-stats', projectId] as const,
    resourceMemberStats: (projectId?: string) => ['project-resource-member-stats', projectId] as const,
    priorityStats: (projectId?: string, parentMilestoneId?: string) => [
      'project-priority-stats',
      projectId,
      parentMilestoneId
    ]
  },
  // Milestones
  milestones: {
    all: ['milestones'] as const,
    byParent: (projectId?: string, parentMilestoneId?: string) => ['milestones', projectId, parentMilestoneId] as const,
    tasks: (milestoneId?: string) => ['milestones-tasks', milestoneId] as const,
    childMilestones: (parentMilestoneId?: string) => ['child-milestones', parentMilestoneId] as const,
    stats: (parentMilestoneId?: string) => ['milestone-stats', parentMilestoneId] as const
  },
  // Tasks
  tasks: {
    all: ['tasks'] as const,
    list: ({
      parentMilestoneId,
      pageIndex,
      pageSize,
      sortBy,
      labelIds,
      milestoneIds,
      endDate,
      startDate,
      isCompleted,
      name,
      memberIds,
      priorities,
      isWatchingTask
    }: UseGetTasksParams) =>
      [
        ...queryKeys.tasks.listParent(parentMilestoneId),
        pageIndex,
        pageSize,
        sortBy,
        labelIds,
        milestoneIds,
        endDate,
        startDate,
        isCompleted,
        name,
        memberIds,
        priorities,
        isWatchingTask
      ] as const,
    listParent: (parentMilestoneId?: string) => [...queryKeys.tasks.all, parentMilestoneId] as const,
    detail: (taskId?: string) => ['task', taskId] as const,
    members: (taskId?: string) => ['taskMembers', taskId] as const,
    myAssigned: (projectId?: string, userId?: string) => ['my-assigned-tasks', projectId, userId] as const
  },
  // Subtasks
  subtasks: {
    all: ['subtasks'] as const,
    byTask: (taskId?: string) => ['subtasks', taskId] as const
  },
  // Comments
  comments: {
    all: ['comments'] as const,
    byTask: (taskId?: string) => ['comments', taskId] as const
  },
  // Notifications
  notifications: {
    all: ['notifications'] as const,
    list: (userId?: string, pageSize?: number) => ['notifications', userId, pageSize] as const,
    unreadCount: {
      all: () => ['unread-count'] as const,
      byUser: (userId?: string) => ['unread-count', userId] as const
    }
  },
  // Location
  location: {
    provinces: () => ['provinces'] as const,
    wards: (provinceCode?: string) => ['wards', provinceCode] as const
  },
  // Domains
  domains: {
    all: () => ['domains'] as const,
    list: (searchTerm?: string, pageIndex?: number, pageSize?: number) =>
      ['domains', searchTerm, pageIndex, pageSize] as const,
    stats: () => ['domain-stats'] as const
  },
  // Attachments
  attachments: {
    byTask: (taskId?: string) => ['attachments', taskId] as const
  },
  // Organizations
  organizations: {
    detail: (organizationId?: string) => ['organization', organizationId] as const,
    stats: () => ['organization-stats'] as const
  },
  // Roles
  roles: {
    stats: () => ['role-stats'] as const
  },
  // Project Resources
  projectResources: {
    all: (projectId?: string) => ['project-resources', projectId] as const,
    list: ({
      projectId,
      pageIndex,
      pageSize,
      sortBy,
      name,
      from,
      to,
      mimeTypes,
      memberIds
    }: UseGetProjectResourcesParams) =>
      ['project-resources', projectId, pageIndex, pageSize, sortBy, name, from, to, mimeTypes, memberIds] as const
  },
  // Efficiency
  efficiency: {
    heatmap: ({ projectId, from, to }: GetProjectHeatmapParams) => ['heatmap', projectId, from, to] as const,
    taskStats: ({ projectId, from, to, parentMilestoneId, isViewInMonth }: GetProjectTaskStatsParams) =>
      ['task-stats', projectId, from, to, parentMilestoneId, isViewInMonth] as const
  }
} as const
