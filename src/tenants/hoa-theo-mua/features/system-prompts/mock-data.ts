import { SystemPromptType, type SystemPromptDetail, type SystemPromptSummary } from './types'

export const mockSystemPromptSummaries: SystemPromptSummary[] = [
  { id: 'mock-platform-rules', type: SystemPromptType.PlatformRule },
  { id: 'mock-image-to-image', type: SystemPromptType.ImageToImage }
]

const mockSystemPrompts: Record<string, SystemPromptDetail> = {
  'mock-platform-rules': {
    id: 'mock-platform-rules',
    type: SystemPromptType.PlatformRule,
    content:
      '<h1>SYSTEM PROMPT: NỀN TẢNG FACEBOOK</h1><ul><li>Tạo mở bài thu hút.</li><li>Dùng emoji tự nhiên.</li><li>Thêm hashtag phù hợp.</li></ul>'
  },
  'mock-image-to-image': {
    id: 'mock-image-to-image',
    type: SystemPromptType.ImageToImage,
    content:
      '<h1>SYSTEM PROMPT: TẠO ẢNH TỪ ẢNH GỐC</h1><ul><li>Giữ chủ thể và bố cục chính từ ảnh gốc.</li><li>Áp dụng phong cách được yêu cầu một cách tự nhiên.</li></ul>'
  }
}

export const getMockSystemPrompt = (id: string) => mockSystemPrompts[id]
