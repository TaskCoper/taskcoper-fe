import config from '@/shared/config'
import { clearAllUserPreferences } from '@/shared/utils'
import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios'
import i18n from './i18n/i18n'

interface ApiResponse {
  isSuccess: boolean
  isFailure: boolean
  error: {
    code: string
    message: string
  }
}

export interface BaseResponse<T> extends ApiResponse {
  value: T
}

export interface BasePaginationResponse<T> extends ApiResponse {
  value: {
    items: T[]
    pageIndex: number
    pageSize: number
    totalCount: number
    hasNextPage: boolean
    hasPreviousPage: boolean
  }
}

export interface ErrorResponse {
  title: string
  status: number
  detail: string
  messageCode: string
  errors: Record<string, unknown>[] | null
}

export const api = axios.create({
  baseURL: `${config.baseURL}/api`,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json'
  },
  paramsSerializer: (params) => {
    const searchParams = new URLSearchParams()

    Object.entries(params).forEach(([key, value]) => {
      if (value === null || value === undefined) {
        return
      }

      if (Array.isArray(value)) {
        value.forEach((item) => {
          searchParams.append(key, item)
        })
      } else {
        searchParams.append(key, String(value))
      }
    })

    return searchParams.toString()
  }
})

api.interceptors.request.use((config) => {
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
  const currentLanguage = i18n.language || 'en'

  config.headers['Accept-Language'] = currentLanguage
  config.headers['X-Timezone'] = timezone

  return config
})

const refreshAccessToken = async (): Promise<boolean> => {
  try {
    await axios.post(
      `${config.baseURL}/api/v1/users/refresh_token`,
      {},
      {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )

    return true
  } catch (err) {
    const error = err as AxiosError<ErrorResponse>

    // If refresh token is invalid
    if (error.response?.data?.messageCode === 'InvalidRefreshToken') {
      clearAllUserPreferences()
      const isOnSignInPage = window.location.pathname === '/sign-in'

      // Avoid hard-reload loops when a protected call is made from /sign-in.
      if (!isOnSignInPage) {
        window.location.replace('/sign-in')
      }
    }

    return false
  }
}

let isRefreshing = false
let refreshSubscribers: ((error: AxiosError | null) => void)[] = []

const subscribeTokenRefresh = (cb: (error: AxiosError | null) => void) => {
  refreshSubscribers.push(cb)
}

const onRefreshed = (error: AxiosError | null = null) => {
  refreshSubscribers.forEach((cb) => cb(error))
  refreshSubscribers = []
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }
    const status = error.response?.status
    const messageCode = (error.response?.data as ErrorResponse)?.messageCode

    const isExpiredAccessToken =
      status === 401 && (messageCode === 'ExpiredAccessToken' || messageCode === 'MissingAccessToken')
    const isRefreshRequest = originalRequest.url?.includes('/users/refresh_token')

    if (!originalRequest || !isExpiredAccessToken || isRefreshRequest) {
      return Promise.reject(error)
    }

    if (originalRequest._retry) {
      return Promise.reject(error)
    }

    originalRequest._retry = true

    // If a refresh is already in progress, wait for it to finish then retry
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        subscribeTokenRefresh((err) => {
          // Updated: Reject the promise if the refresh failed
          if (err) {
            return reject(err)
          }
          // After the token is refreshed, retry the original request.
          // The browser will automatically use the newly set cookie.
          resolve(api(originalRequest))
        })
      })
    }

    isRefreshing = true

    const isRefreshSuccessful = await refreshAccessToken()

    isRefreshing = false

    if (!isRefreshSuccessful) {
      // Notify queued requests that the refresh failed
      onRefreshed(error)
      return Promise.reject(error)
    }

    // Notify queued requests of success
    onRefreshed(null)

    // Retry the original request. The browser will automatically use the newly set cookie.
    return api(originalRequest)
  }
)

export default api
