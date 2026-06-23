const config = {
  baseURL: import.meta.env.VITE_API_BASE_URL as string,
  baseFileUrl: import.meta.env.VITE_FILE_BASE_URL as string
} as const

export default config
