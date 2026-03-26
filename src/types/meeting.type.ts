export const MeetingStatus = {
  FREE: 'Free',
  BOOKED: 'Booked',
  COMPLETED: 'Completed',
  RESCHEDULE: 'Reschedule',
  CANCELLED: 'Cancelled',
  SUSPENDED: 'Suspended'
} as const

export type MeetingStatus = (typeof MeetingStatus)[keyof typeof MeetingStatus]

export const MeetingStatusLabel = {
  [MeetingStatus.FREE]: 'meeting.status.free',
  [MeetingStatus.BOOKED]: 'meeting.status.booked',
  [MeetingStatus.COMPLETED]: 'meeting.status.completed',
  [MeetingStatus.RESCHEDULE]: 'meeting.status.reschedule',
  [MeetingStatus.CANCELLED]: 'meeting.status.cancelled',
  [MeetingStatus.SUSPENDED]: 'meeting.status.suspended'
}

export type MeetingStatusLabel = (typeof MeetingStatusLabel)[keyof typeof MeetingStatusLabel]

export interface Meeting {
  meetingId: string
  packageBookingSequence: number
  status: MeetingStatus
  note: string | null
  meetingLink: string | null
  parentId: string | null
  startTimeUtc: string
  endTimeUtc: string
}

export interface MeetingBookingProject {
  id: string
  name: string
  logoImage: string | null
  coverImage: string | null
}

export interface MeetingBookingMentor {
  id: string
  email: string
  firstName: string
  lastName: string
  avatarUrl: string | null
}

export interface MeetingBooking {
  id: string
  mentorId: string
  mentorUserId: string
  startTimeUtc: string
  endTimeUtc: string
  status: MeetingStatus
  packageBookingId: string
  packageName: string
  packageSequence: number
  projectId: string | null
  project: MeetingBookingProject | null
  mentor: MeetingBookingMentor
}

export interface MeetingDetail extends MeetingBooking {
  note: string
  parentId: string | null
  projectId: string
  meetingLink: string | null
  project: {
    id: string
    name: string
    logoImage: string
    coverImage: string
    members: Array<{
      userId: string
      email: string
      firstName: string
      lastName: string
      avatarUrl: string | null
      role: string
    }>
  }
  subMeetings: Array<{
    id: string
    startTimeUtc: string
    endTimeUtc: string
    status: MeetingStatus
  }>
}
