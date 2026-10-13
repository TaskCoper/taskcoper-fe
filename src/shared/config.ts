const config = {
  baseURL: import.meta.env.VITE_API_BASE_URL as string,
  baseFileUrl: import.meta.env.VITE_FILE_BASE_URL as string,
  sentryEnvironment: import.meta.env.VITE_SENTRY_ENVIRONMENT as string | undefined
} as const

export default config
