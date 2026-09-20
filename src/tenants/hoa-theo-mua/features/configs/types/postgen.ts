/** Các record `postgen.*`, theo cách editor đọc chúng. */
import type { Config } from './config'

/** Metadata riêng của từng nền tảng, không phải bản thân prompt. */
export interface PostgenPlatformMeta {
  logo: string
  isActive: boolean
}

export interface PostgenPlatform extends PostgenPlatformMeta {
  slug: string
  key: string
  label: string
  html: string
  config: Config | null
}
