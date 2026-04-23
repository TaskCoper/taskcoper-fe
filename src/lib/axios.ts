import config from '@/shared/config'
import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios'
import i18n from './i18n/i18n'
import { useAuthStore } from './zustand/auth.store'

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
  errors: Record<string, unknown>[] | null
}

export const api = axios.create({
  baseURL: `${config.baseURL}/api`,
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

  const { accessToken } = useAuthStore.getState()
  if (accessToken && !config.url?.includes('/users/refresh_token')) {
    config.headers.Authorization = `Bearer ${accessToken}`
  }

  return config
})

const refreshAccessToken = async (): Promise<string | null> => {
  const { refreshToken, accessToken } = useAuthStore.getState()
  if (!refreshToken || !accessToken) {
    return null
  }

  try {
    const { data } = await axios.post<
      BaseResponse<{
        accessToken: string
        refreshToken: string
      }>
    >(
      `${config.baseURL}/api/v1/users/refresh_token`,
      { accessToken, refreshToken },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )

    useAuthStore.getState().updateTokens({
      accessToken: data.value.accessToken,
      refreshToken: data.value.refreshToken
    })

    return data.value.accessToken
  } catch (err) {
    console.error('Token refresh failed', err)
    useAuthStore.getState().signOut()
    return null
  }
}

let isRefreshing = false
let refreshSubscribers: ((token: string) => void)[] = []

const subscribeTokenRefresh = (cb: (token: string) => void) => {
  refreshSubscribers.push(cb)
}

const onRefreshed = (token: string) => {
  refreshSubscribers.forEach((cb) => cb(token))
  refreshSubscribers = []
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

    // TODO: need more check instead of just the status
    const isUnauthorized = error.response?.status === 401

    // 2. IMPORTANT: Don't try to refresh if the failed request WAS the refresh token endpoint
    const isRefreshRequest = originalRequest.url?.includes('/users/refresh_token')

    if (!originalRequest || !isUnauthorized || isRefreshRequest) {
      if (isRefreshRequest) {
        useAuthStore.getState().signOut()
      }
      return Promise.reject(error)
    }

    if (originalRequest._retry) {
      useAuthStore.getState().signOut()
      return Promise.reject(error)
    }

    originalRequest._retry = true

    if (isRefreshing) {
      return new Promise((resolve) => {
        subscribeTokenRefresh((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`
          resolve(api(originalRequest))
        })
      })
    }

    isRefreshing = true

    const newToken = await refreshAccessToken()

    isRefreshing = false

    if (!newToken) {
      window.location.href = '/'
      return Promise.reject(error)
    }

    onRefreshed(newToken)
    originalRequest.headers.Authorization = `Bearer ${newToken}`

    return api(originalRequest)
  }
)

export default api
