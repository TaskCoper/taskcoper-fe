export interface RecruitmentRequest {
  id: string
  title: string
  coverLetter: string
  attachments: string[]
  isRead: boolean
  createdAt: string
  user: {
    userId: string
    fullName: string
    email: string
    phoneNumber: string | null
    avatar: string | null
  }
  jobDescription: {
    id: string
    title: string
  }
}
