import type { SignInFormValues, SignUpFormValues, VerifyEmailFormValues } from '@/features/auth/validations'
import type { GetUsersParams } from '@/features/users/hooks/use-get-users'
import type {
  ChangePasswordFormValues,
  ForgotPasswordFormValues,
  ResetPasswordFormValues,
  UpdateMeFormValues,
  VerifyCodeFormValues
} from '@/features/users/validations'
import api, { type BasePaginationResponse, type BaseResponse } from '@/lib/axios'
import type { User, UserDetail } from '@/types/user.type'

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
    const { data } = await api.get<BaseResponse<User>>(`/v1/${this.baseUrl}/me`)

    return data.value
  }

  getUser = async ({ userIdentifier }: { userIdentifier?: string }) => {
    if (!userIdentifier) return null
    const { data } = await api.get<BaseResponse<UserDetail>>(`/v1/${this.baseUrl}/${userIdentifier}`)

    return data.value
  }

  updateMe = async ({ body }: { body: Omit<UpdateMeFormValues, 'cityCode' | 'wardCode'> }) => {
    const { data } = await api.put<BaseResponse<string>>(`/v1/${this.baseUrl}/me`, body)

    return data.value
  }

  updateMyTimezone = async (me: User, timeZone: string) => {
    const body = {
      firstName: me.firstName,
      lastName: me.lastName,
      email: me.email,
      avatar: me.avatar,
      phoneNumber: me.phoneNumber,
      address: me.address,
      city: me.city,
      state: me.state,
      timeZone,
      domainIds: me.domains.map((d: { id: string }) => d.id)
    }
    const { data } = await api.put<BaseResponse<string>>(`/v1/${this.baseUrl}/me`, body)

    return data.value
  }

  changePassword = async ({ body }: { body: ChangePasswordFormValues }) => {
    const { data } = await api.post<BaseResponse<string>>(`/v1/${this.baseUrl}/change_password`, body)

    return data.value
  }

  resetPassword = async ({ body }: { body: ResetPasswordFormValues }) => {
    const { data } = await api.post<BaseResponse<string>>(`/v1/${this.baseUrl}/change_password`, body)

    return data.value
  }

  forgotPassword = async ({ body }: { body: ForgotPasswordFormValues }) => {
    const { data } = await api.post<BaseResponse<string>>(`/v1/${this.baseUrl}/forgot_password`, body)

    return data.value
  }

  verifyForgotPasswordCode = async ({ body }: { body: VerifyCodeFormValues }) => {
    const { data } = await api.post<BaseResponse<{ accessToken: string; refreshToken: string }>>(
      `/v1/${this.baseUrl}/verify_change_password_code`,
      body
    )

    return data.value
  }

  getUsers = async ({ searchTerm, pageIndex, pageSize, sortBy, organizationId, domainId, roles }: GetUsersParams) => {
    const { data } = await api.get<BasePaginationResponse<User>>(`/v1/${this.baseUrl}`, {
      params: {
        searchTerm,
        pageIndex,
        pageSize,
        sortBy,
        organizationId,
        domainId,
        role: roles
      }
    })

    return data
  }
}

const userService = new UserService()
export default userService
