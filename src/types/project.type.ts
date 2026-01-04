export interface ProjectPreview {
  id: string
  name: string
  startDate: string
  endDate: string
  coverImage: string | null
  logoImage: string | null
  teamSize: string | null
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
  name: string
  description: string | null
  startDate: string | null
  endDate: string | null
  coverImage: string | null
  logoImage: string | null
  teamSize: string | null
  teamContact: string | null
  teamEmail: string | null
  progress: number
  schoolSubject: string | null
  organizationId: string | null
  organizationName: string | null
  organizationLogo: string | null
  domains: ProjectDomain[]
}

export interface ProjectDomain {
  id: string
  domainId: string
  name: string
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
