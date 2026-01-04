const config = {
  baseURL: (import.meta.env.VITE_API_BASE_URL as string) || 'https://taskcoper-api.bentran1vn.com',
  baseFileUrl: (import.meta.env.VITE_FILE_BASE_URL as string) || 'https://taskcoper.hcm.ss.bfcplatform.vn'
} as const

export default config
