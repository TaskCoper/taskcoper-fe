export interface ProjectPreview {
  id: string
  name: string
  startDate: string
  endDate: string
  coverImage: string | null
  logoImage: string | null
  teamSize: number | null
  schoolSubject: string | null
}

export interface ProjectMember {
  userId: string
  fullName: string
  email: string
  avatar: string | null
  role: number
  isMain: boolean
  isEditor: boolean
}

export interface Project {
  id: string
}

// APIs
export interface InviteMembersPayload {
  projectId: string
  inviteMembers: {
    userId: string
    isEditor: boolean
    inviteExpireDate: string | null
  }[]
}
