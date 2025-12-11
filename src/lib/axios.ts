import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { useAuthStore } from './zustand/auth.store'

if (!import.meta.env.VITE_API_URL) {
  throw new Error('VITE_API_URL is not set')
}

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL as string,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json'
  },
  paramsSerializer: (params) => {
    const searchParams = new URLSearchParams()

    Object.entries(params).forEach(([key, value]) => {
      if (value === null || value === undefined) return

      if (Array.isArray(value)) {
        value.forEach((item) => searchParams.append(key, String(item)))
      } else {
        searchParams.append(key, String(value))
      }
    })

    return searchParams.toString()
  }
})

api.interceptors.request.use((config) => {
  const { accessToken } = useAuthStore.getState()
  if (accessToken && !config.url?.includes('/auth/refresh-token')) {
    config.headers.Authorization = `Bearer ${accessToken}`
  }

  return config
})

const refreshAccessToken = async (): Promise<string | null> => {
  const { refreshToken } = useAuthStore.getState()
  if (!refreshToken) {
    return null
  }

  try {
    // TODO: replace this with actual api payload
    const { data } = await axios.post<{
      access_token: string
      refresh_token?: string
    }>(
      `${import.meta.env.VITE_API_URL}/auth/refresh-token`,
      { refresh_token: refreshToken },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )

    useAuthStore.getState().updateTokens({
      accessToken: data.access_token,
      refreshToken: data.refresh_token
    })

    return data.access_token
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

    // TODO: replace this with actual api error
    const isUnauthorized = error.response?.status === 401
    const isInvalidTokenError = (error.response?.data as { error?: string })?.error === 'Error.InvalidAccessToken'

    if (!originalRequest || !isUnauthorized || !isInvalidTokenError) {
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
      // TODO: replace this with actual redirect
      window.location.href = '/auth/sign-in'
      return Promise.reject(error)
    }

    onRefreshed(newToken)
    originalRequest.headers.Authorization = `Bearer ${newToken}`

    return api(originalRequest)
  }
)

export default api
