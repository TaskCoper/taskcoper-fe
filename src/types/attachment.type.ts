export interface Attachment {
  projectResourceId: string
  name: string
  url: string
  isUpload: boolean
  storageKey: string
  mimeType: string
  bytes: number
  position: number
  uploadedBy: {
    userId: string
    firstName: string
    lastName: string
    avatar: string | null
    email: string
  }
  createdAt: string
}
