const config = {
  baseURL: import.meta.env.VITE_API_BASE_URL as string,
  baseFileUrl: import.meta.env.VITE_FILE_BASE_URL as string,
  // tenants
  hoaTheoMuaBaseURL: import.meta.env.VITE_HOA_THEO_MUA_API_BASE_URL as string
} as const

export default config
