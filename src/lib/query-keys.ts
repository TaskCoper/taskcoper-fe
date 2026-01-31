import type { GetProjectsParams } from '@/features/projects/hooks/use-get-projects'
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
    list: ({ searchTerm, pageIndex, pageSize, sortBy, organizationId, domainId }: GetUsersParams) =>
      [...queryKeys.users.all, searchTerm, pageIndex, pageSize, sortBy, organizationId, domainId] as const
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
    labels: (projectId?: string) => ['project-labels', projectId]
  },
  // Milestones
  milestones: {
    all: ['milestones'] as const,
    byParent: (projectId?: string, parentMilestoneId?: string) => ['milestones', projectId, parentMilestoneId] as const,
    tasks: (milestoneId?: string) => ['milestones-tasks', milestoneId] as const,
    childMilestones: (parentMilestoneId?: string) => ['child-milestones', parentMilestoneId] as const
  },
  // Tasks
  tasks: {
    all: ['tasks'] as const,
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
  }
} as const
