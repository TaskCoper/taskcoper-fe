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
  [MeetingStatus.FREE]: 'Free',
  [MeetingStatus.BOOKED]: 'Booked',
  [MeetingStatus.COMPLETED]: 'Completed',
  [MeetingStatus.RESCHEDULE]: 'Reschedule',
  [MeetingStatus.CANCELLED]: 'Cancelled',
  [MeetingStatus.SUSPENDED]: 'Suspended'
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
