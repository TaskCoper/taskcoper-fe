import type { GetProjectHeatmapParams } from '@/features/charts/hooks/use-get-project-heatmap'
import type { GetProjectTaskStatsParams } from '@/features/charts/hooks/use-get-project-task-stats'
import type { GetProjectTopContributorsParams } from '@/features/charts/hooks/use-get-project-top-contributors'
import type { GetCommissionsParams } from '@/features/commissions/hooks/use-get-commissions'
import type { GetMentorMeetingsParams } from '@/features/meetings/hooks/use-get-mentor-meetings'
import type { GetMyMeetingsParams } from '@/features/meetings/hooks/use-get-my-meetings'
import type { GetProjectMeetingsParams } from '@/features/meetings/hooks/use-get-project-meetings'
import type { GetMentorApplicationsParams } from '@/features/mentor-applications/hooks/use-get-mentor-applications'
import type { GetMyMentorApplicationsParams } from '@/features/mentor-applications/hooks/use-get-my-mentor-applications'
import type { GetMentorsParams } from '@/features/mentors/hooks/use-get-mentors'
import type { UseGetProjectMembersParams } from '@/features/projects/hooks/use-get-project-members'
import type { UseGetProjectResourcesParams } from '@/features/projects/hooks/use-get-project-resources'
import type { GetProjectRevenuesParams } from '@/features/projects/hooks/use-get-project-revenues'
import type { GetProjectsParams } from '@/features/projects/hooks/use-get-projects'
import type { GetMySchedulesParams } from '@/features/schedules/hooks/use-get-my-schedules'
import type { GetScheduleParams } from '@/features/schedules/hooks/use-get-schedule'
import type { UseGetTasksParams } from '@/features/tasks/hooks/use-get-tasks'
import type { GetMyTransactionsParams } from '@/features/transactions/hooks/use-get-my-transactions'
import type { GetUsersParams } from '@/features/users/hooks/use-get-users'
import type { GetVoucherRedemptionsParams } from '@/features/vouchers/hooks/use-get-voucher-redemptions'
import type { GetVouchersParams } from '@/features/vouchers/hooks/use-get-vouchers'

export const queryKeys = {
  // Auth
  auth: {
    all: ['auth'] as const,
    me: () => ['me'] as const
  },
  // Users
  users: {
    all: ['users'] as const,
    googleAuthUrl: (userId?: string) => [...queryKeys.users.all, 'google-auth-url', userId] as const,
    list: ({ searchTerm, pageIndex, pageSize, sortBy, organizationId, domainId, roles }: GetUsersParams) =>
      [...queryKeys.users.all, searchTerm, pageIndex, pageSize, sortBy, organizationId, domainId, roles] as const,
    detail: (userId?: string) => ['user', userId] as const
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
    listMyInfinite: (userId?: string, status?: string[], searchTerm?: string, pageSize?: number) =>
      [...queryKeys.projects.allMy, 'infinite', userId, status, searchTerm, pageSize] as const,
    detail: (projectId?: string) => ['project', projectId] as const,
    members: {
      all: (projectId?: string) => ['members', projectId] as const,
      list: ({ projectId, searchTerm, pageIndex, pageSize, excludeIds }: UseGetProjectMembersParams) =>
        [...queryKeys.projects.members.all(projectId), searchTerm, pageIndex, pageSize, excludeIds] as const
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
      ['task-stats', projectId, from, to, parentMilestoneId, isViewInMonth] as const,
    topContributors: ({ projectId, from, to }: GetProjectTopContributorsParams) =>
      ['top-contributors', projectId, from, to] as const,
    onTimeCompleters: ({ projectId, from, to }: GetProjectTopContributorsParams) =>
      ['on-time-completers', projectId, from, to] as const
  },
  // Mentors
  mentors: {
    list: ({ pageIndex, pageSize, domainIds, searchTerm, rating, sortBy }: GetMentorsParams) =>
      ['mentors', pageIndex, pageSize, domainIds, searchTerm, rating, sortBy] as const,
    listInfinite: ({ pageIndex, pageSize, domainIds, searchTerm, rating, sortBy }: GetMentorsParams) =>
      ['mentors-infinite', pageIndex, pageSize, domainIds, searchTerm, rating, sortBy] as const
  },
  // Mentor Applications
  mentorApplications: {
    all: ['mentor-applications'] as const,
    list: ({ status, sortBy }: GetMentorApplicationsParams = {}) =>
      [...queryKeys.mentorApplications.all, status, sortBy] as const,
    allMy: ['mentor-applications', 'my'] as const,
    my: ({ status, sortBy }: GetMyMentorApplicationsParams = {}) =>
      [...queryKeys.mentorApplications.allMy, status, sortBy] as const
  },
  // Mentor Packages
  mentorPackages: {
    all: ['mentor-packages'] as const,
    my: () => [...queryKeys.mentorPackages.all, 'my'] as const,
    purchased: () => [...queryKeys.mentorPackages.all, 'purchased'] as const,
    purchasedDetail: (packageId?: string) => [...queryKeys.mentorPackages.purchased(), packageId] as const,
    list: ({ mentorId }: { mentorId?: string }) => [...queryKeys.mentorPackages.all, mentorId] as const,
    listInfinite: (params: { pageIndex?: number; pageSize?: number; searchTerm?: string } = {}) =>
      [...queryKeys.mentorPackages.all, 'infinite', params] as const,
    detail: (packageId?: string) => ['mentor-package', packageId] as const
  },
  // Schedules
  schedules: {
    all: ['schedules'] as const,
    allMy: ['schedules', 'my'] as const,
    my: ({ isActive }: GetMySchedulesParams = {}) => [...queryKeys.schedules.allMy, isActive] as const,
    list: ({ userId, activeFrom, activeTo }: GetScheduleParams) =>
      [...queryKeys.schedules.all, userId, activeFrom, activeTo] as const
  },
  // Project Revenues
  projectRevenues: {
    all: (projectId?: string) => ['project-revenues', projectId] as const,
    list: ({
      projectId,
      pageIndex,
      pageSize,
      labelIds,
      searchTerm,
      type,
      sortBy,
      startDate,
      endDate
    }: GetProjectRevenuesParams) =>
      [
        ...queryKeys.projectRevenues.all(projectId),
        pageIndex,
        pageSize,
        labelIds,
        searchTerm,
        type,
        sortBy,
        startDate,
        endDate
      ] as const,
    stats: (projectId?: string) => ['project-revenue-stats', projectId] as const,
    typeStats: (projectId?: string) => ['project-revenue-type-stats', projectId] as const
  },
  // Project Revenue Labels
  projectRevenueLabels: {
    all: (projectId?: string) => ['project-revenue-labels', projectId] as const,
    list: (projectId?: string) => [...queryKeys.projectRevenueLabels.all(projectId)] as const,
    stats: (projectId?: string) => ['project-revenue-labels-stats', projectId] as const
  },
  // Meetings
  meetings: {
    all: ['meetings'] as const,
    allMentor: (mentorId?: string) => ['meetings', 'mentor', mentorId] as const,
    mentor: ({ mentorId, activeFrom, activeTo }: GetMentorMeetingsParams) =>
      [...queryKeys.meetings.allMentor(mentorId), activeFrom, activeTo] as const,
    allMy: ['meetings', 'my'] as const,
    my: ({ activeFrom, activeTo }: GetMyMeetingsParams) => [...queryKeys.meetings.allMy, activeFrom, activeTo] as const,
    detail: (meetingId?: string) => ['meeting', meetingId] as const,
    allProject: ['meetings', 'project'] as const,
    project: ({ projectId, activeFrom, activeTo }: GetProjectMeetingsParams) =>
      [...queryKeys.meetings.allProject, projectId, activeFrom, activeTo] as const
  },
  // Transactions
  transactions: {
    all: ['transactions'] as const,
    my: ({ pageIndex, pageSize, status, type, sortBy, searchTerm, createdFrom, createdTo }: GetMyTransactionsParams) =>
      [
        ...queryKeys.transactions.all,
        'my',
        pageIndex,
        pageSize,
        status,
        type,
        sortBy,
        searchTerm,
        createdFrom,
        createdTo
      ] as const,
    detail: (transactionId?: string) => ['transaction', transactionId] as const,
    statusStats: () => ['transaction-status-stats'] as const,
    typeStats: () => ['transaction-type-stats'] as const,
    status: (transactionId?: string) => ['transaction-status', transactionId] as const
  },
  // Commissions
  commissions: {
    all: ['commissions'] as const,
    list: ({ page, limit, targetModel, titleLevel, minAmount, maxAmount, sortBy }: GetCommissionsParams) =>
      [...queryKeys.commissions.all, page, limit, targetModel, titleLevel, minAmount, maxAmount, sortBy] as const
  },
  // Vouchers
  vouchers: {
    all: ['vouchers'] as const,
    single: ['voucher'] as const,
    list: ({
      pageIndex,
      pageSize,
      searchTerm,
      isActive,
      discountType,
      scope,
      targetType,
      targetId,
      sortBy,
      startTime,
      endTime
    }: GetVouchersParams) =>
      [
        ...queryKeys.vouchers.all,
        pageIndex,
        pageSize,
        searchTerm,
        isActive,
        discountType,
        scope,
        targetType,
        targetId,
        sortBy,
        startTime,
        endTime
      ] as const,
    detail: (voucherId?: string) => [...queryKeys.vouchers.single, voucherId] as const,
    scopeStats: () => [...queryKeys.vouchers.single, 'scope-stats'] as const,
    typeStats: () => [...queryKeys.vouchers.single, 'type-stats'] as const,
    targetStats: () => [...queryKeys.vouchers.single, 'target-stats'] as const,
    statusStats: () => [...queryKeys.vouchers.single, 'status-stats'] as const,
    byCode: (voucherCode?: string) => [...queryKeys.vouchers.single, 'code', voucherCode] as const,
    redemptions: ({ voucherId, pageIndex, pageSize, sortBy, searchTerm }: GetVoucherRedemptionsParams) =>
      [...queryKeys.vouchers.detail(voucherId), 'redemptions', pageIndex, pageSize, sortBy, searchTerm] as const
  }
} as const
