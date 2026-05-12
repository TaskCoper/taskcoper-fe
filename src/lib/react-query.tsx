import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import type { AxiosError } from 'axios'
import { useState } from 'react'
import type { ErrorResponse } from './axios'

declare module '@tanstack/react-query' {
  interface Register {
    defaultError: AxiosError<ErrorResponse>
  }
}

export default function ReactQueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            throwOnError: (error) => {
              if (error.response?.status === 401) {
                if (
                  // If access token is expired => axios interceptors
                  // If access token is invalid => layout will handle it
                  error.response.data.messageCode === 'ExpiredAccessToken' ||
                  error.response.data.messageCode === 'InvalidAccessToken'
                ) {
                  return false
                }
              }

              if (error.response?.status === 403) {
                if (error.response.data.messageCode === 'EmailNotVerified') {
                  return false
                }
              }

              return true
            },
            refetchOnWindowFocus: false,
            retry: (failureCount, error) => {
              // Don't retry on 400/401/403/404/500
              if (
                error.response?.status === 400 ||
                error.response?.status === 401 ||
                error.response?.status === 403 ||
                error.response?.status === 404 ||
                error.response?.status === 500
              )
                return false

              return failureCount < 1
            },
            retryDelay: 3000,
            staleTime: 1000 * 60 * 5
          }
        }
      })
  )

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} position='right' buttonPosition='bottom-right' />
    </QueryClientProvider>
  )
}
