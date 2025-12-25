export interface UserEntity {
  id: string
  email: string
  firstName: string
  lastName: string
  phoneNumber: string | null
  avatar: string | null
  role: string
  address: string | null
  city: string | null
  state: string | null
  projectCreatedCount: number
  createdOnUtc: string
}
