import type {
  ChangeFloralMockupStatusPayload,
  CreateFloralMockupPayload,
  DeleteFloralMockupPayload,
  FloralMockupListItem,
  FloralMockupsPage,
  GetFloralMockupsParams
} from './types'

const previewImages = [
  'https://i.pinimg.com/736x/78/1e/63/781e6304bc1967c3648de8a5375f9eca.jpg',
  'https://i.pinimg.com/originals/89/13/2c/89132ca5253dc117bbddeaefb7c06092.jpg',
  'https://i.pinimg.com/736x/d5/59/5a/d5595a35c192b0530faba550152da213.jpg',
  'https://i.pinimg.com/736x/b5/20/fe/b520fe497e0da91079444252bae89b7d.jpg',
  'https://reminiscentblooms.com/cdn/shop/products/IMG_49212_2048x.jpg?v=1673324843',
  'https://i.pinimg.com/736x/d4/96/fc/d496fc5e3b65175fd45767e3bb5ea2da.jpg',
  'https://i.pinimg.com/originals/6e/26/1b/6e261b04aefd60a2c4e86e72b4a8143d.jpg'
]

const descriptions = [
  'Mockup bó hoa phong cách thanh lịch, sử dụng nền sáng và bố cục tối giản để làm nổi bật màu sắc của từng loại hoa.',
  'Thiết kế phù hợp cho các mẫu hoa sinh nhật với giấy gói pastel, ánh sáng tự nhiên và góc chụp chính diện.',
  'Mockup hoa chúc mừng có bố cục sang trọng, phù hợp để tạo ảnh giới thiệu sản phẩm trên website và mạng xã hội.',
  'Phông nền trung tính kết hợp cùng bàn gỗ sáng màu, giúp mẫu hoa giữ được cảm giác gần gũi và tự nhiên.',
  'Thiết kế dành cho bó hoa tone hồng với không gian mềm mại, ánh sáng dịu và khoảng trống cân đối xung quanh sản phẩm.',
  'Mockup hiện đại với nền studio, phù hợp cho nhiều kích thước bó hoa và các chiến dịch quảng bá theo mùa.'
]

const normalizeSearch = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/gi, 'd')
    .toLocaleLowerCase('vi')
    .trim()

let mockFloralMockups: FloralMockupListItem[] = Array.from({ length: 28 }, (_, index) => ({
  id: `floral-mockup-${index + 1}`,
  name: `Mockup mẫu hoa ${String(index + 1).padStart(2, '0')}`,
  description: index % 9 === 0 ? null : descriptions[index % descriptions.length],
  imageUrl: index === 12 ? '/images/floral-mockup-preview-not-found.jpg' : previewImages[index % previewImages.length],
  isActive: index % 4 !== 0,
  isDeleted: false,
  createdAt: new Date(Date.now() - index * 86400000).toISOString(),
  updatedAt: new Date(Date.now() - index * 3600000).toISOString()
}))

export const createMockFloralMockup = async (payload: CreateFloralMockupPayload): Promise<FloralMockupListItem> => {
  const mockup: FloralMockupListItem = {
    id: `floral-mockup-${crypto.randomUUID()}`,
    name: payload.name.trim(),
    description: payload.description?.trim() || null,
    imageUrl: payload.imageUrl,
    isActive: payload.isActive,
    isDeleted: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }

  mockFloralMockups = [mockup, ...mockFloralMockups]
  return mockup
}

export const getMockFloralMockups = async ({
  pageIndex = 1,
  pageSize = 10,
  search,
  isActive
}: GetFloralMockupsParams): Promise<FloralMockupsPage> => {
  const normalizedSearch = search ? normalizeSearch(search) : ''
  const filteredMockups = mockFloralMockups.filter((mockup) => {
    if (mockup.isDeleted) return false

    const matchesSearch = !normalizedSearch || normalizeSearch(mockup.name).includes(normalizedSearch)
    const matchesStatus = isActive === undefined || mockup.isActive === isActive

    return matchesSearch && matchesStatus
  })
  const safePageSize = Math.max(1, pageSize)
  const totalCount = filteredMockups.length
  const totalPages = Math.max(1, Math.ceil(totalCount / safePageSize))
  const safePageIndex = Math.min(Math.max(1, pageIndex), totalPages)
  const startIndex = (safePageIndex - 1) * safePageSize

  return {
    items: filteredMockups.slice(startIndex, startIndex + safePageSize),
    pageIndex: safePageIndex,
    pageSize: safePageSize,
    totalCount,
    hasNextPage: safePageIndex < totalPages,
    hasPreviousPage: safePageIndex > 1
  }
}

export const changeMockFloralMockupStatus = async (
  payload: ChangeFloralMockupStatusPayload
): Promise<FloralMockupListItem> => {
  const mockup = mockFloralMockups.find((item) => item.id === payload.id)
  if (!mockup || mockup.isDeleted) throw new Error('Floral mockup not found')

  const updatedMockup = { ...mockup, isActive: payload.isActive }
  mockFloralMockups = mockFloralMockups.map((item) => (item.id === payload.id ? updatedMockup : item))
  return updatedMockup
}

export const softDeleteMockFloralMockup = async (payload: DeleteFloralMockupPayload): Promise<FloralMockupListItem> => {
  const mockup = mockFloralMockups.find((item) => item.id === payload.id)
  if (!mockup || mockup.isDeleted) throw new Error('Floral mockup not found')

  const deletedMockup = { ...mockup, isDelete: true }
  mockFloralMockups = mockFloralMockups.map((item) => (item.id === payload.id ? deletedMockup : item))
  return deletedMockup
}
