import type { GetCommissionsParams } from '@/features/commissions/hooks/use-get-commissions'
import type { GetFeedbacksParams } from '@/features/feedbacks/hooks/use-get-feedbacks'
import type { GetMentorMeetingsParams } from '@/features/meetings/hooks/use-get-mentor-meetings'
import type { GetMyMeetingsParams } from '@/features/meetings/hooks/use-get-my-meetings'
import type { GetProjectMeetingsParams } from '@/features/meetings/hooks/use-get-project-meetings'
import type { GetMentorApplicationsParams } from '@/features/mentor-applications/hooks/use-get-mentor-applications'
import type { GetMyMentorApplicationsParams } from '@/features/mentor-applications/hooks/use-get-my-mentor-applications'
import type { GetMentorPackageBookingsParams } from '@/features/mentor-packages/hooks/use-get-mentor-package-bookings'
import type { GetMentorPackageStatisticsParams } from '@/features/mentor-packages/hooks/use-get-mentor-package-statistics'
import type { GetMentorPackagesParams } from '@/features/mentor-packages/hooks/use-get-mentor-packages'
import type { GetMentorPackagesStatisticsParams } from '@/features/mentor-packages/hooks/use-get-mentor-packages-statistics'
import type { GetMyMentorPackagesParams } from '@/features/mentor-packages/hooks/use-get-my-mentor-packages'
import type { GetPurchasedMentorPackagesParams } from '@/features/mentor-packages/hooks/use-get-purchased-mentor-packages'
import type { GetMentorsParams } from '@/features/mentors/hooks/use-get-mentors'
import type { GetMyIncomingRequestsParams } from '@/features/package-bookings/hooks/use-get-my-incoming-requests'
import type { GetMyOutgoingRequestsParams } from '@/features/package-bookings/hooks/use-get-my-outgoing-requests'
import type { GetProjectLabelStatsParams } from '@/features/projects/analytics/hooks/use-get-project-label-stats'
import type { GetProjectPriorityStatsParams } from '@/features/projects/analytics/hooks/use-get-project-priority-stats'
import type { GetProjectHeatmapParams } from '@/features/projects/charts/hooks/use-get-project-heatmap'
import type { GetProjectTaskStatsParams } from '@/features/projects/charts/hooks/use-get-project-task-stats'
import type { GetProjectTopContributorsParams } from '@/features/projects/charts/hooks/use-get-project-top-contributors'
import type { GetProjectsParams } from '@/features/projects/core/hooks/use-get-projects'
import type { GetProjectMemberRequestsParams } from '@/features/projects/members/hooks/use-get-project-member-requests'
import type { GetProjectMembersParams } from '@/features/projects/members/hooks/use-get-project-members'
import type { GetProjectResourcesParams } from '@/features/projects/resources/hooks/use-get-project-resources'
import type { GetProjectRevenueParams } from '@/features/projects/revenue/hooks/use-get-project-revenue'
import type { GetProjectRoleParams } from '@/features/projects/roles/hooks/use-get-project-role'
import type { GetTasksParams } from '@/features/projects/tasks/core/hooks/use-get-tasks'
import type { GetMySchedulesParams } from '@/features/schedules/hooks/use-get-my-schedules'
import type { GetScheduleParams } from '@/features/schedules/hooks/use-get-schedule'
import type { GetMyTransactionsParams } from '@/features/transactions/hooks/use-get-my-transactions'
import type { GetUsersParams } from '@/features/users/hooks/use-get-users'
import type { GetVoucherRedemptionsParams } from '@/features/vouchers/hooks/use-get-voucher-redemptions'
import type { GetVouchersParams } from '@/features/vouchers/hooks/use-get-vouchers'

export const queryKeys = {
  // Auth
  auth: {
    all: ['auth'] as const,
    me: () => [...queryKeys.auth.all, 'me'] as const
  },

  // Users
  users: {
    all: ['users'] as const,
    lists: () => [...queryKeys.users.all, 'list'] as const,
    list: (params: GetUsersParams) => [...queryKeys.users.lists(), params] as const,
    details: () => [...queryKeys.users.all, 'detail'] as const,
    detail: (userId?: string) => [...queryKeys.users.details(), userId] as const,
    googleAuthUrl: (userId?: string) => [...queryKeys.users.detail(userId), 'google-auth-url'] as const
  },

  // Projects
  projects: {
    all: ['projects'] as const,

    // System-wide project list (admin)
    lists: () => [...queryKeys.projects.all, 'list'] as const,
    list: (params: GetProjectsParams) => [...queryKeys.projects.lists(), params] as const,
    forPackage: () => [...queryKeys.projects.lists(), 'for-package'] as const,

    // Current user's projects
    allMy: () => [...queryKeys.projects.lists(), 'my'] as const,
    listMy: (userId?: string, status?: string[], searchTerm?: string, pageIndex?: number, pageSize?: number) =>
      [...queryKeys.projects.allMy(), userId, status, searchTerm, pageIndex, pageSize] as const,
    listMyInfinite: (userId?: string, status?: string[], searchTerm?: string, pageSize?: number) =>
      [...queryKeys.projects.allMy(), 'infinite', userId, status, searchTerm, pageSize] as const,

    // Per-project
    details: () => [...queryKeys.projects.all, 'detail'] as const,
    detail: (identifier?: string) => [...queryKeys.projects.details(), identifier] as const,

    parentMilestones: (identifier?: string) => [...queryKeys.projects.detail(identifier), 'parent-milestones'] as const,
    labels: (projectIdentifier?: string) => [...queryKeys.projects.detail(projectIdentifier), 'labels'] as const,
    labelStatsAll: (projectIdentifier?: string) =>
      [...queryKeys.projects.detail(projectIdentifier), 'label-stats'] as const,
    labelStats: ({ projectIdentifier, parentMilestoneIdentifier }: GetProjectLabelStatsParams) =>
      [...queryKeys.projects.labelStatsAll(projectIdentifier), parentMilestoneIdentifier] as const,
    taskStatusStats: (projectIdentifier?: string, parentMilestoneIdentifier?: string) =>
      [...queryKeys.projects.detail(projectIdentifier), 'task-status-stats', parentMilestoneIdentifier] as const,
    memberStats: (projectIdentifier?: string, parentMilestoneIdentifier?: string) =>
      [...queryKeys.projects.detail(projectIdentifier), 'member-stats', parentMilestoneIdentifier] as const,
    resourceStats: (projectIdentifier?: string) =>
      [...queryKeys.projects.detail(projectIdentifier), 'resource-stats'] as const,
    mimeTypeStats: (projectIdentifier?: string) =>
      [...queryKeys.projects.detail(projectIdentifier), 'mime-type-stats'] as const,
    resourceMemberStats: (projectIdentifier?: string) =>
      [...queryKeys.projects.detail(projectIdentifier), 'resource-member-stats'] as const,
    priorityStats: ({ projectIdentifier, parentMilestoneIdentifier }: GetProjectPriorityStatsParams) =>
      [...queryKeys.projects.detail(projectIdentifier), 'priority-stats', parentMilestoneIdentifier] as const,
    myPermissions: (projectIdentifier?: string) =>
      [...queryKeys.projects.detail(projectIdentifier), 'my-permissions'] as const,

    members: {
      all: (identifier?: string) => [...queryKeys.projects.detail(identifier), 'members'] as const,
      list: ({ identifier, searchTerm, pageIndex, pageSize, excludeIds }: GetProjectMembersParams) =>
        [...queryKeys.projects.members.all(identifier), searchTerm, pageIndex, pageSize, excludeIds] as const,
      detail: ({ projectIdentifier, userId }: { projectIdentifier?: string; userId?: string }) =>
        [...queryKeys.projects.members.all(projectIdentifier), 'detail', userId] as const,
      allRequests: (projectIdentifier?: string) =>
        [...queryKeys.projects.detail(projectIdentifier), 'member-requests'] as const,
      requests: ({
        projectIdentifier,
        isInviteUser,
        pageIndex,
        pageSize,
        searchTerm
      }: GetProjectMemberRequestsParams) =>
        [
          ...queryKeys.projects.members.allRequests(projectIdentifier),
          isInviteUser,
          pageIndex,
          pageSize,
          searchTerm
        ] as const
    },

    roles: {
      all: (identifier?: string) => [...queryKeys.projects.detail(identifier), 'roles'] as const,
      list: (identifier?: string) => [...queryKeys.projects.roles.all(identifier)] as const,
      detail: ({ projectIdentifier, roleId }: GetProjectRoleParams) =>
        [...queryKeys.projects.roles.all(projectIdentifier), 'detail', roleId] as const,
      templates: (projectIdentifier?: string) =>
        [...queryKeys.projects.detail(projectIdentifier), 'role-templates'] as const
    },

    positionTitles: {
      all: (identifier?: string) => [...queryKeys.projects.detail(identifier), 'position-titles'] as const,
      list: (identifier?: string) => [...queryKeys.projects.positionTitles.all(identifier)] as const,
      member: (projectIdentifier?: string, userId?: string) =>
        [...queryKeys.projects.detail(projectIdentifier), 'member-position-titles', userId] as const
    },

    resources: {
      all: (projectIdentifier?: string) => [...queryKeys.projects.detail(projectIdentifier), 'resources'] as const,
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
      }: GetProjectResourcesParams) =>
        [
          ...queryKeys.projects.resources.all(projectIdentifier),
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

    efficiency: {
      heatmap: ({ projectId, from, to }: GetProjectHeatmapParams) =>
        [...queryKeys.projects.detail(projectId), 'efficiency', 'heatmap', from, to] as const,
      taskStats: ({ projectId, from, to, parentMilestoneId, isViewInMonth, userId }: GetProjectTaskStatsParams) =>
        [
          ...queryKeys.projects.detail(projectId),
          'efficiency',
          'task-stats',
          from,
          to,
          parentMilestoneId,
          isViewInMonth,
          userId
        ] as const,
      topContributors: ({ projectId, from, to }: GetProjectTopContributorsParams) =>
        [...queryKeys.projects.detail(projectId), 'efficiency', 'top-contributors', from, to] as const,
      onTimeCompleters: ({ projectId, from, to }: GetProjectTopContributorsParams) =>
        [...queryKeys.projects.detail(projectId), 'efficiency', 'on-time-completers', from, to] as const
    },

    revenues: {
      all: (projectIdentifier?: string) => [...queryKeys.projects.detail(projectIdentifier), 'revenues'] as const,
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
      }: GetProjectRevenueParams) =>
        [
          ...queryKeys.projects.revenues.all(projectIdentifier),
          pageIndex,
          pageSize,
          labelIds,
          searchTerm,
          type,
          sortBy,
          startDate,
          endDate
        ] as const,
      stats: (projectIdentifier?: string) =>
        [...queryKeys.projects.detail(projectIdentifier), 'revenue-stats'] as const,
      typeStats: (projectIdentifier?: string) =>
        [...queryKeys.projects.detail(projectIdentifier), 'revenue-type-stats'] as const
    },

    revenueLabels: {
      all: (projectIdentifier?: string) => [...queryKeys.projects.detail(projectIdentifier), 'revenue-labels'] as const,
      list: (projectIdentifier?: string) =>
        [...queryKeys.projects.revenueLabels.all(projectIdentifier), 'list'] as const,
      stats: (projectIdentifier?: string) =>
        [...queryKeys.projects.detail(projectIdentifier), 'revenue-labels-stats'] as const
    }
  },

  // Milestones
  milestones: {
    all: ['milestones'] as const,
    byParent: (identifier?: string, parentMilestoneIdentifier?: string) =>
      [...queryKeys.milestones.all, 'by-parent', identifier, parentMilestoneIdentifier] as const,
    tasks: (milestoneId?: string) => [...queryKeys.milestones.all, 'tasks', milestoneId] as const,
    childMilestones: (parentMilestoneIdentifier?: string) =>
      [...queryKeys.milestones.all, 'children', parentMilestoneIdentifier] as const,
    stats: (parentMilestoneIdentifier?: string) =>
      [...queryKeys.milestones.all, 'stats', parentMilestoneIdentifier] as const
  },

  // Tasks
  tasks: {
    all: ['tasks'] as const,
    lists: () => [...queryKeys.tasks.all, 'list'] as const,
    // listParent is a prefix of list — invalidating it cascades to every filter combo for that milestone
    listParent: (parentMilestoneIdentifier?: string) =>
      [...queryKeys.tasks.lists(), 'by-parent', parentMilestoneIdentifier] as const,
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
    }: GetTasksParams) =>
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
    myAssigned: (identifier?: string, userId?: string) =>
      [...queryKeys.tasks.lists(), 'my-assigned', identifier, userId] as const,
    details: () => [...queryKeys.tasks.all, 'detail'] as const,
    detail: (taskIdentifier?: string) => [...queryKeys.tasks.details(), taskIdentifier] as const,
    members: (taskId?: string) => [...queryKeys.tasks.detail(taskId), 'members'] as const
  },

  // Subtasks
  subtasks: {
    byTask: (taskIdentifier?: string) => [...queryKeys.tasks.detail(taskIdentifier), 'subtasks'] as const
  },

  // Comments
  comments: {
    byTask: (taskIdentifier?: string) => [...queryKeys.tasks.detail(taskIdentifier), 'comments'] as const
  },

  // Attachments
  attachments: {
    byTask: (taskId?: string) => [...queryKeys.tasks.detail(taskId), 'attachments'] as const
  },

  // Notifications
  notifications: {
    all: ['notifications'] as const,
    list: (userId?: string, pageSize?: number) => [...queryKeys.notifications.all, 'list', userId, pageSize] as const,
    unreadCount: {
      all: () => [...queryKeys.notifications.all, 'unread-count'] as const,
      byUser: (userId?: string) => [...queryKeys.notifications.unreadCount.all(), userId] as const
    }
  },

  // Location
  location: {
    all: ['location'] as const,
    provinces: () => [...queryKeys.location.all, 'provinces'] as const,
    wards: (provinceCode?: string) => [...queryKeys.location.all, 'wards', provinceCode] as const
  },

  // Domains
  domains: {
    all: ['domains'] as const,
    lists: () => [...queryKeys.domains.all, 'list'] as const,
    list: (searchTerm?: string, pageIndex?: number, pageSize?: number) =>
      [...queryKeys.domains.lists(), searchTerm, pageIndex, pageSize] as const,
    listInfinite: (searchTerm?: string, pageSize?: number) =>
      [...queryKeys.domains.lists(), 'infinite', searchTerm, pageSize] as const,
    stats: () => [...queryKeys.domains.all, 'stats'] as const
  },

  // Organizations
  organizations: {
    all: ['organizations'] as const,
    detail: (organizationId?: string | null) => [...queryKeys.organizations.all, 'detail', organizationId] as const,
    stats: () => [...queryKeys.organizations.all, 'stats'] as const
  },

  // Roles (system-level role stats)
  roles: {
    all: ['roles'] as const,
    stats: () => [...queryKeys.roles.all, 'stats'] as const
  },

  // Mentors
  mentors: {
    all: ['mentors'] as const,
    lists: () => [...queryKeys.mentors.all, 'list'] as const,
    list: ({ pageIndex, pageSize, domainIds, searchTerm, rating, sortBy }: GetMentorsParams) =>
      [...queryKeys.mentors.lists(), pageIndex, pageSize, domainIds, searchTerm, rating, sortBy] as const,
    listInfinite: ({ pageIndex, pageSize, domainIds, searchTerm, rating, sortBy }: GetMentorsParams) =>
      [...queryKeys.mentors.lists(), 'infinite', pageIndex, pageSize, domainIds, searchTerm, rating, sortBy] as const
  },

  // Mentor Applications
  mentorApplications: {
    all: ['mentor-applications'] as const,
    lists: () => [...queryKeys.mentorApplications.all, 'list'] as const,
    list: ({ status, sortBy }: GetMentorApplicationsParams = {}) =>
      [...queryKeys.mentorApplications.lists(), status, sortBy] as const,
    allMy: () => [...queryKeys.mentorApplications.all, 'my'] as const,
    my: ({ status, sortBy }: GetMyMentorApplicationsParams = {}) =>
      [...queryKeys.mentorApplications.allMy(), status, sortBy] as const
  },

  // Mentor Packages
  mentorPackages: {
    all: ['mentor-packages'] as const,
    lists: () => [...queryKeys.mentorPackages.all, 'list'] as const,
    allMy: () => [...queryKeys.mentorPackages.all, 'my'] as const,
    my: ({ pageIndex, pageSize, sortBy, searchTerm, isPin }: GetMyMentorPackagesParams) =>
      [...queryKeys.mentorPackages.allMy(), pageIndex, pageSize, sortBy, searchTerm, isPin] as const,
    purchased: ({ mode, isNeedFeedback }: GetPurchasedMentorPackagesParams) =>
      [...queryKeys.mentorPackages.all, 'purchased', mode, isNeedFeedback] as const,
    projectPurchased: (projectIdentifier?: string) =>
      [...queryKeys.mentorPackages.all, 'purchased', 'project', projectIdentifier] as const,
    purchasedDetail: (packageId?: string) =>
      [...queryKeys.mentorPackages.all, 'purchased', 'detail', packageId] as const,
    list: ({ mentorId, isPin }: GetMentorPackagesParams) =>
      [...queryKeys.mentorPackages.lists(), mentorId, isPin] as const,
    listInfinite: (params: { pageIndex?: number; pageSize?: number; searchTerm?: string } = {}) =>
      [...queryKeys.mentorPackages.lists(), 'infinite', params] as const,

    details: () => [...queryKeys.mentorPackages.all, 'detail'] as const,
    detail: (packageId?: string) => [...queryKeys.mentorPackages.details(), packageId] as const,

    requests: {
      all: () => [...queryKeys.mentorPackages.all, 'requests'] as const,
      allMyIncoming: () => [...queryKeys.mentorPackages.requests.all(), 'my', 'incoming'] as const,
      myIncoming: ({ mentorPackageId, status, pageIndex, pageSize, searchTerm }: GetMyIncomingRequestsParams) =>
        [
          ...queryKeys.mentorPackages.requests.allMyIncoming(),
          mentorPackageId,
          status,
          pageIndex,
          pageSize,
          searchTerm
        ] as const,
      allMyOutgoing: () => [...queryKeys.mentorPackages.requests.all(), 'my', 'outgoing'] as const,
      myOutgoing: ({ mentorPackageId, status, pageIndex, pageSize }: GetMyOutgoingRequestsParams) =>
        [...queryKeys.mentorPackages.requests.allMyOutgoing(), mentorPackageId, status, pageIndex, pageSize] as const,
      details: () => [...queryKeys.mentorPackages.requests.all(), 'detail'] as const,
      detailIncoming: (requestId?: string) =>
        [...queryKeys.mentorPackages.requests.details(), 'incoming', requestId] as const,
      detailOutgoing: (requestId?: string) =>
        [...queryKeys.mentorPackages.requests.details(), 'outgoing', requestId] as const
    },
    statistics: ({ mentorPackageId, startTime, endTime }: GetMentorPackageStatisticsParams) =>
      [...queryKeys.mentorPackages.detail(mentorPackageId), 'statistics', startTime, endTime] as const,
    pinStatistics: () => [...queryKeys.mentorPackages.all, 'pin', 'statistics'] as const,
    allBookings: (mentorPackageId?: string) =>
      [...queryKeys.mentorPackages.detail(mentorPackageId), 'bookings'] as const,
    bookings: ({ mentorPackageId, pageIndex, pageSize, sortBy, status }: GetMentorPackageBookingsParams) =>
      [...queryKeys.mentorPackages.allBookings(mentorPackageId), pageIndex, pageSize, sortBy, status] as const,
    allStatistics: ({ startTime, endTime }: GetMentorPackagesStatisticsParams) =>
      [...queryKeys.mentorPackages.all, 'statistics', startTime, endTime] as const
  },

  // Schedules
  schedules: {
    all: ['schedules'] as const,
    lists: () => [...queryKeys.schedules.all, 'list'] as const,
    allMy: () => [...queryKeys.schedules.all, 'my'] as const,
    my: ({ isActive }: GetMySchedulesParams = {}) => [...queryKeys.schedules.allMy(), isActive] as const,
    list: ({ userId, activeFrom, activeTo }: GetScheduleParams) =>
      [...queryKeys.schedules.lists(), userId, activeFrom, activeTo] as const
  },

  // Meetings
  meetings: {
    all: ['meetings'] as const,
    details: () => [...queryKeys.meetings.all, 'detail'] as const,
    detail: (meetingId?: string) => [...queryKeys.meetings.details(), meetingId] as const,
    allMentor: (mentorId?: string) => [...queryKeys.meetings.all, 'mentor', mentorId] as const,
    mentor: ({ mentorId, activeFrom, activeTo }: GetMentorMeetingsParams) =>
      [...queryKeys.meetings.allMentor(mentorId), activeFrom, activeTo] as const,
    allMy: () => [...queryKeys.meetings.all, 'my'] as const,
    my: ({ activeFrom, activeTo, packageBookingIds, mode, status }: GetMyMeetingsParams) =>
      [...queryKeys.meetings.allMy(), activeFrom, activeTo, packageBookingIds, mode, status] as const,
    allProject: (projectIdentifier?: string) => [...queryKeys.meetings.all, 'project', projectIdentifier] as const,
    project: ({ projectIdentifier, activeFrom, activeTo, status }: GetProjectMeetingsParams) =>
      [...queryKeys.meetings.allProject(projectIdentifier), activeFrom, activeTo, status] as const
  },

  // Transactions
  transactions: {
    all: ['transactions'] as const,
    allMy: () => [...queryKeys.transactions.all, 'my'] as const,
    my: ({ pageIndex, pageSize, status, type, sortBy, searchTerm, createdFrom, createdTo }: GetMyTransactionsParams) =>
      [
        ...queryKeys.transactions.allMy(),
        pageIndex,
        pageSize,
        status,
        type,
        sortBy,
        searchTerm,
        createdFrom,
        createdTo
      ] as const,
    details: () => [...queryKeys.transactions.all, 'detail'] as const,
    detail: (transactionId?: string) => [...queryKeys.transactions.details(), transactionId] as const,
    status: (transactionId?: string) => [...queryKeys.transactions.detail(transactionId), 'status'] as const,
    statusStats: () => [...queryKeys.transactions.all, 'status-stats'] as const,
    typeStats: () => [...queryKeys.transactions.all, 'type-stats'] as const
  },

  // Commissions
  commissions: {
    all: ['commissions'] as const,
    lists: () => [...queryKeys.commissions.all, 'list'] as const,
    list: ({ page, limit, targetModel, titleLevel, minAmount, maxAmount, sortBy }: GetCommissionsParams) =>
      [...queryKeys.commissions.lists(), page, limit, targetModel, titleLevel, minAmount, maxAmount, sortBy] as const,
    public: () => [...queryKeys.commissions.all, 'public'] as const
  },

  // Vouchers — single root, all per-voucher data nests under detail(id)
  vouchers: {
    all: ['vouchers'] as const,
    lists: () => [...queryKeys.vouchers.all, 'list'] as const,
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
        ...queryKeys.vouchers.lists(),
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
    details: () => [...queryKeys.vouchers.all, 'detail'] as const,
    detail: (voucherId?: string) => [...queryKeys.vouchers.details(), voucherId] as const,
    byCode: (voucherCode?: string) => [...queryKeys.vouchers.all, 'by-code', voucherCode] as const,
    scopeStats: () => [...queryKeys.vouchers.all, 'scope-stats'] as const,
    typeStats: () => [...queryKeys.vouchers.all, 'type-stats'] as const,
    targetStats: () => [...queryKeys.vouchers.all, 'target-stats'] as const,
    statusStats: () => [...queryKeys.vouchers.all, 'status-stats'] as const,
    redemptions: ({ voucherId, pageIndex, pageSize, sortBy, searchTerm }: GetVoucherRedemptionsParams) =>
      [...queryKeys.vouchers.detail(voucherId), 'redemptions', pageIndex, pageSize, sortBy, searchTerm] as const
  },

  // HTM Nhanh.vn Orders
  htmOrdersNhanhVn: {
    all: ['htm-orders-nhanh-vn'] as const,
    lists: () => [...queryKeys.htmOrdersNhanhVn.all, 'list'] as const,
    list: () => [...queryKeys.htmOrdersNhanhVn.lists()] as const
  },

  // Feedbacks
  feedbacks: {
    all: ['feedbacks'] as const,
    lists: () => [...queryKeys.feedbacks.all, 'list'] as const,
    list: ({ targetId, targetType, pageIndex, pageSize, sortBy, searchTerm }: GetFeedbacksParams) =>
      [...queryKeys.feedbacks.lists(), targetId, targetType, pageIndex, pageSize, sortBy, searchTerm] as const,
    listInfinite: ({ targetId, targetType, pageSize, sortBy, searchTerm }: GetFeedbacksParams) =>
      [...queryKeys.feedbacks.lists(), 'infinite', targetId, targetType, pageSize, sortBy, searchTerm] as const,
    byPackage: (packageBookingId?: string) => [...queryKeys.feedbacks.all, 'package', packageBookingId] as const
  }
} as const
