import type { SignInFormValues, SignUpFormValues, VerifyEmailFormValues } from '@/features/auth/validations'
import api, { type BaseResponse } from '@/lib/axios'
import type { UserEntity } from '@/types/user.type'

class UserService {
  private readonly baseUrl = 'users'

  signUp = async ({ body }: { body: SignUpFormValues }) => {
    const { data } = await api.post(`/v1/${this.baseUrl}/register`, body)
    return data
  }

  signIn = async ({ body }: { body: SignInFormValues }) => {
    const { data } = await api.post<BaseResponse<{ accessToken: string; refreshToken: string }>>(
      `/v1/${this.baseUrl}/login`,
      body
    )

    return data.value
  }

  signOut = async ({ email }: { email: string }) => {
    const { data } = await api.post<BaseResponse<string>>(`/v1/${this.baseUrl}/logout`, { email })

    return data.value
  }

  resendCode = async ({ email }: { email: string }) => {
    const { data } = await api.post<BaseResponse<string>>(
      `/v1/${this.baseUrl}/resend_verify_account_code?email=${email}`
    )

    return data.value
  }

  verifyEmail = async ({ body }: { body: VerifyEmailFormValues }) => {
    const { data } = await api.post<BaseResponse<{ accessToken: string; refreshToken: string }>>(
      `/v1/${this.baseUrl}/verify_account`,
      body
    )

    return data.value
  }

  getMe = async () => {
    const { data } = await api.get<BaseResponse<UserEntity>>(`/v1/${this.baseUrl}/me`)

    return data.value
  }
}

const userService = new UserService()
export default userService
