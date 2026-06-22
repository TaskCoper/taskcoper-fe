import config from '@/shared/config'
import { clearAllUserPreferences } from '@/shared/utils'
import axios, { AxiosError, type AxiosInstance, type InternalAxiosRequestConfig } from 'axios'
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

const PUBLIC_ROUTE_PATHS = new Set([
  '/',
  '/commissions',
  '/forgot-password',
  '/redirect',
  '/sign-in',
  '/sign-up',
  '/terms-of-service',
  '/privacy-policy'
])

const normalizePathname = (pathname: string) => {
  if (pathname === '/') {
    return pathname
  }

  return pathname.replace(/\/+$/, '')
}

const isPublicRoutePath = (pathname: string) => {
  const normalizedPathname = normalizePathname(pathname)
  return PUBLIC_ROUTE_PATHS.has(normalizedPathname)
}

const refreshAccessToken = async (refreshTokenUrl: string, expiredRefreshTokenCode: string): Promise<boolean> => {
  try {
    await axios.post(
      refreshTokenUrl,
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
    if (error.response?.data?.messageCode === expiredRefreshTokenCode) {
      clearAllUserPreferences()
      const isOnPublicRoute = isPublicRoutePath(window.location.pathname)

      // Avoid hard-reload loops when a protected call is made from public pages.
      if (!isOnPublicRoute) {
        window.location.replace('/sign-in')
      }
    }

    return false
  }
}

// Shared across every client so concurrent 401s anywhere only trigger one refresh.
let isRefreshing = false
let refreshSubscribers: ((error: AxiosError | null) => void)[] = []

const subscribeTokenRefresh = (cb: (error: AxiosError | null) => void) => {
  refreshSubscribers.push(cb)
}

const onRefreshed = (error: AxiosError | null = null) => {
  refreshSubscribers.forEach((cb) => cb(error))
  refreshSubscribers = []
}

interface CreateApiClientOptions {
  refreshTokenPath: string
  expiredAccessTokenCodes: readonly string[]
  expiredRefreshTokenCode: string
}

export const createApiClient = (
  baseURL: string,
  { refreshTokenPath, expiredAccessTokenCodes, expiredRefreshTokenCode }: CreateApiClientOptions
): AxiosInstance => {
  const refreshTokenUrl = `${baseURL}${refreshTokenPath}`

  const instance = axios.create({
    baseURL: `${baseURL}`,
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

  instance.interceptors.request.use((config) => {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
    const currentLanguage = i18n.language || 'en'

    config.headers['Accept-Language'] = currentLanguage
    config.headers['X-Timezone'] = timezone

    return config
  })

  instance.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }
      const status = error.response?.status
      const messageCode = (error.response?.data as ErrorResponse)?.messageCode

      const isExpiredAccessToken = status === 401 && !!messageCode && expiredAccessTokenCodes.includes(messageCode)
      const isRefreshRequest = originalRequest.url?.includes(refreshTokenPath)

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
            resolve(instance(originalRequest))
          })
        })
      }

      isRefreshing = true

      const isRefreshSuccessful = await refreshAccessToken(refreshTokenUrl, expiredRefreshTokenCode)

      isRefreshing = false

      if (!isRefreshSuccessful) {
        // Notify queued requests that the refresh failed
        onRefreshed(error)
        return Promise.reject(error)
      }

      // Notify queued requests of success
      onRefreshed(null)

      // Retry the original request. The browser will automatically use the newly set cookie.
      return instance(originalRequest)
    }
  )

  return instance
}

export const api = createApiClient(`${config.baseURL}/api`, {
  refreshTokenPath: '/v1/users/refresh_token',
  expiredAccessTokenCodes: ['ExpiredAccessToken', 'MissingAccessToken', 'InvalidAccessToken'],
  expiredRefreshTokenCode: 'InvalidRefreshToken'
})

export default api
