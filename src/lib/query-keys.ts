import type { GetProjectHeatmapParams } from '@/features/charts/hooks/use-get-project-heatmap'
import type { GetProjectTaskStatsParams } from '@/features/charts/hooks/use-get-project-task-stats'
import type { GetProjectTopContributorsParams } from '@/features/charts/hooks/use-get-project-top-contributors'
import type { GetCommissionsParams } from '@/features/commissions/hooks/use-get-commissions'
import type { GetFeedbacksParams } from '@/features/feedbacks/hooks/use-get-feedbacks'
import type { GetMentorMeetingsParams } from '@/features/meetings/hooks/use-get-mentor-meetings'
import type { GetMyMeetingsParams } from '@/features/meetings/hooks/use-get-my-meetings'
import type { GetProjectMeetingsParams } from '@/features/meetings/hooks/use-get-project-meetings'
import type { GetMentorApplicationsParams } from '@/features/mentor-applications/hooks/use-get-mentor-applications'
import type { GetMyMentorApplicationsParams } from '@/features/mentor-applications/hooks/use-get-my-mentor-applications'
import type { GetMentorPackageStatisticsParams } from '@/features/mentor-packages/hooks/use-get-mentor-package-statistics'
import type { GetMentorPackagesParams } from '@/features/mentor-packages/hooks/use-get-mentor-packages'
import type { GetMyMentorPackagesParams } from '@/features/mentor-packages/hooks/use-get-my-mentor-packages'
import type { GetPurchasedMentorPackagesParams } from '@/features/mentor-packages/hooks/use-get-purchased-mentor-packages'
import type { GetMentorsParams } from '@/features/mentors/hooks/use-get-mentors'
import type { UseGetProjectMembersParams } from '@/features/projects/hooks/use-get-project-members'
import type { UseGetProjectResourcesParams } from '@/features/projects/hooks/use-get-project-resources'
import type { GetProjectRevenuesParams } from '@/features/projects/hooks/use-get-project-revenues'
import type { GetProjectRoleParams } from '@/features/projects/hooks/use-get-project-role'
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
    detail: (identifier?: string) => ['project', identifier] as const,
    members: {
      all: (identifier?: string) => ['members', identifier] as const,
      list: ({ identifier, searchTerm, pageIndex, pageSize, excludeIds }: UseGetProjectMembersParams) =>
        [...queryKeys.projects.members.all(identifier), searchTerm, pageIndex, pageSize, excludeIds] as const,
      detail: ({ projectIdentifier, userId }: { projectIdentifier?: string; userId?: string }) =>
        ['members', 'detail', projectIdentifier, userId] as const
    },
    parentMilestones: (identifier?: string) => ['parent-milestones', identifier] as const,
    labels: (projectIdentifier?: string) => ['project-labels', projectIdentifier],
    labelStatsAll: (projectIdentifier: string) => ['project-label-stats', projectIdentifier],
    labelStats: (projectIdentifier: string, parentMilestoneId?: string) => [
      ...queryKeys.projects.labelStatsAll(projectIdentifier),
      parentMilestoneId
    ],
    taskStatusStats: (projectIdentifier: string, parentMilestoneIdentifier?: string) => [
      'project-task-status-stats',
      projectIdentifier,
      parentMilestoneIdentifier
    ],
    memberStats: (projectIdentifier: string, parentMilestoneId?: string) => [
      'project-member-stats',
      projectIdentifier,
      parentMilestoneId
    ],
    resourceStats: (projectIdentifier?: string) => ['project-resource-stats', projectIdentifier] as const,
    mimeTypeStats: (projectIdentifier?: string) => ['project-mime-type-stats', projectIdentifier] as const,
    resourceMemberStats: (projectIdentifier?: string) => ['project-resource-member-stats', projectIdentifier] as const,
    priorityStats: (identifier?: string, milestoneIdentifier?: string) => [
      'project-priority-stats',
      identifier,
      milestoneIdentifier
    ],
    myPermissions: (projectIdentifier?: string) => ['project-my-permissions', projectIdentifier] as const,
    roles: {
      all: (identifier?: string) => ['project-roles', identifier] as const,
      list: (identifier?: string) => [...queryKeys.projects.roles.all(identifier)] as const,
      detail: ({ projectIdentifier, roleId }: GetProjectRoleParams) =>
        ['project-role', projectIdentifier, roleId] as const,
      templates: (projectIdentifier?: string) => ['project-role-templates', projectIdentifier] as const
    },
    positionTitles: {
      all: (identifier?: string) => ['project-position-titles', identifier] as const,
      list: (identifier?: string) => [...queryKeys.projects.positionTitles.all(identifier)] as const,
      member: (projectIdentifier?: string, userId?: string) =>
        ['project-member-position-titles', projectIdentifier, userId] as const
    },
    forPackage: () => ['projects-for-package'] as const
  },
  // Milestones
  milestones: {
    all: ['milestones'] as const,
    byParent: (identifier?: string, parentMilestoneIdentifier?: string) =>
      ['milestones', identifier, parentMilestoneIdentifier] as const,
    tasks: (milestoneId?: string) => ['milestones-tasks', milestoneId] as const,
    childMilestones: (parentMilestoneIdentifier?: string) => ['child-milestones', parentMilestoneIdentifier] as const,
    stats: (parentMilestoneIdentifier?: string) => ['milestone-stats', parentMilestoneIdentifier] as const
  },
  // Tasks
  tasks: {
    all: ['tasks'] as const,
    list: ({
      parentMilestoneIdentifier,
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
      projectIdentifier,
      isWatchingTask
    }: UseGetTasksParams) =>
      [
        ...queryKeys.tasks.listParent(parentMilestoneIdentifier),
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
        projectIdentifier,
        isWatchingTask
      ] as const,
    listParent: (parentMilestoneIdentifier?: string) => [...queryKeys.tasks.all, parentMilestoneIdentifier] as const,
    detail: (taskIdentifier?: string) => ['task', taskIdentifier] as const,
    members: (taskId?: string) => ['taskMembers', taskId] as const,
    myAssigned: (identifier?: string, userId?: string) => ['my-assigned-tasks', identifier, userId] as const
  },
  // Subtasks
  subtasks: {
    all: ['subtasks'] as const,
    byTask: (taskIdentifier?: string) => ['subtasks', taskIdentifier] as const
  },
  // Comments
  comments: {
    all: ['comments'] as const,
    byTask: (taskIdentifier?: string) => ['comments', taskIdentifier] as const
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
    detail: (organizationId?: string | null) => ['organization', organizationId] as const,
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
      projectIdentifier,
      pageIndex,
      pageSize,
      sortBy,
      name,
      from,
      to,
      mimeTypes,
      memberIds
    }: UseGetProjectResourcesParams) =>
      [
        'project-resources',
        projectIdentifier,
        pageIndex,
        pageSize,
        sortBy,
        name,
        from,
        to,
        mimeTypes,
        memberIds
      ] as const
  },
  // Efficiency
  efficiency: {
    heatmap: ({ projectId, from, to }: GetProjectHeatmapParams) => ['heatmap', projectId, from, to] as const,
    taskStats: ({ projectId, from, to, parentMilestoneId, isViewInMonth, userId }: GetProjectTaskStatsParams) =>
      ['task-stats', projectId, from, to, parentMilestoneId, isViewInMonth, userId] as const,
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
    allMy: ['mentor-packages', 'my'] as const,
    my: ({ pageIndex, pageSize, sortBy, searchTerm, isPin }: GetMyMentorPackagesParams) =>
      [...queryKeys.mentorPackages.allMy, pageIndex, pageSize, sortBy, searchTerm, isPin] as const,
    purchased: ({ mode, isNeedFeedback }: GetPurchasedMentorPackagesParams) =>
      [...queryKeys.mentorPackages.all, 'purchased', mode, isNeedFeedback] as const,
    projectPurchased: (projectIdentifier?: string) =>
      [...queryKeys.mentorPackages.all, 'purchased', 'project', projectIdentifier] as const,
    purchasedDetail: (packageId?: string) =>
      [...queryKeys.mentorPackages.all, 'purchased', 'detail', packageId] as const,
    list: ({ mentorId, isPin }: GetMentorPackagesParams) => [...queryKeys.mentorPackages.all, mentorId, isPin] as const,
    listInfinite: (params: { pageIndex?: number; pageSize?: number; searchTerm?: string } = {}) =>
      [...queryKeys.mentorPackages.all, 'infinite', params] as const,
    detail: (packageId?: string) => ['mentor-package', packageId] as const,
    statistics: ({ mentorPackageId, startTime, endTime }: GetMentorPackageStatisticsParams) =>
      [...queryKeys.mentorPackages.all, 'statistics', mentorPackageId, startTime, endTime] as const,
    pinStatistics: () => [...queryKeys.mentorPackages.all, 'pin', 'statistics'] as const
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
    all: (projectIdentifier?: string) => ['project-revenues', projectIdentifier] as const,
    list: ({
      projectIdentifier,
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
        ...queryKeys.projectRevenues.all(projectIdentifier),
        pageIndex,
        pageSize,
        labelIds,
        searchTerm,
        type,
        sortBy,
        startDate,
        endDate
      ] as const,
    stats: (projectIdentifier?: string) => ['project-revenue-stats', projectIdentifier] as const,
    typeStats: (projectIdentifier?: string) => ['project-revenue-type-stats', projectIdentifier] as const
  },
  // Project Revenue Labels
  projectRevenueLabels: {
    all: (projectId?: string) => ['project-revenue-labels', projectId] as const,
    list: (projectIdentifier?: string) => [...queryKeys.projectRevenueLabels.all(projectIdentifier)] as const,
    stats: (projectIdentifier?: string) => ['project-revenue-labels-stats', projectIdentifier] as const
  },
  // Meetings
  meetings: {
    all: ['meetings'] as const,
    allMentor: (mentorId?: string) => ['meetings', 'mentor', mentorId] as const,
    mentor: ({ mentorId, activeFrom, activeTo }: GetMentorMeetingsParams) =>
      [...queryKeys.meetings.allMentor(mentorId), activeFrom, activeTo] as const,
    allMy: ['meetings', 'my'] as const,
    my: ({ activeFrom, activeTo, packageBookingIds, mode, status }: GetMyMeetingsParams) =>
      [...queryKeys.meetings.allMy, activeFrom, activeTo, packageBookingIds, mode, status] as const,
    detail: (meetingId?: string) => ['meeting', meetingId] as const,
    allProject: (projectIdentifier?: string) => ['meetings', 'project', projectIdentifier] as const,
    project: ({ projectIdentifier, activeFrom, activeTo, status }: GetProjectMeetingsParams) =>
      [...queryKeys.meetings.allProject(projectIdentifier), activeFrom, activeTo, status] as const
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
      [...queryKeys.commissions.all, page, limit, targetModel, titleLevel, minAmount, maxAmount, sortBy] as const,
    public: () => [...queryKeys.commissions.all, 'public'] as const
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
  },
  feedbacks: {
    byPackage: (packageBookingId?: string) => ['feedbacks', 'package', packageBookingId] as const,
    list: ({ targetId, targetType, pageIndex, pageSize, sortBy, searchTerm }: GetFeedbacksParams) =>
      ['feedbacks', targetId, targetType, pageIndex, pageSize, sortBy, searchTerm] as const
  }
} as const
