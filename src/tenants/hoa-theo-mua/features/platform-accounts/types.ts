import type { MarketingPostPlatform } from '../marketing-posts/types'

// Mốc 11 mới mở kết nối Facebook và Instagram. Zalo backend đang tắt (`Zalo:Enabled=false`)
// nên chưa hiện nút kết nối - phần sinh nội dung/ảnh Zalo vẫn chạy bình thường.
export const connectablePlatforms: MarketingPostPlatform[] = ['facebook', 'instagram']

export const PlatformAccountStatus = {
  Connected: 'Connected',
  ReauthRequired: 'ReauthRequired',
  Disabled: 'Disabled'
} as const

export type PlatformAccountStatus = (typeof PlatformAccountStatus)[keyof typeof PlatformAccountStatus]

export interface PlatformAccount {
  id: string
  platform: MarketingPostPlatform
  externalAccountId: string
  pageId: string | null
  displayName: string
  // `Connected` chỉ nói lần kiểm tra gần nhất còn hiệu lực, không có nghĩa là đăng bài được
  status: PlatformAccountStatus
  // Zalo chưa trả danh sách quyền nên rỗng nghĩa là không có dữ liệu, không phải không có quyền
  grantedScopes: string[]
  accessTokenExpiresAt: string | null
  refreshTokenExpiresAt: string | null
  lastValidatedAt: string | null
  lastErrorCode: string | null
  connectedBy: string
  createdAt: string
  updatedAt: string
  // Đổi mỗi lần kết nối lại hoặc ngắt kết nối; backend dùng để chặn ghi đè chéo
  revision: number
}

export interface PlatformAccountSession {
  sessionId: string
  // Mở nguyên văn, không thêm scope hay config_id - backend đã dựng đủ tham số
  authorizationUrl: string
  expiresAt: string
}
