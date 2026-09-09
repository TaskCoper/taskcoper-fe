import {
  AiCardFileStatus,
  type AiFlowerDesignDetail,
  type AiFlowerDesignComboOption,
  type AiFlowerDesignComboOptionsPage,
  type AiFlowerDesignHistoryItem,
  type AiFlowerDesignHistoryPage,
  type GetAiFlowerDesignComboOptionsParams,
  type GetAiFlowerDesignHistoryParams
} from './types'

const customers = [
  { id: 'customer-1', name: 'Nguyễn Minh Anh', phone: '0901 234 567' },
  { id: 'customer-2', name: 'Trần Ngọc Mai', phone: '0938 456 789' },
  { id: 'customer-3', name: 'Lê Hoàng Nam', phone: '0987 654 321' },
  { id: 'customer-4', name: 'Phạm Thu Hà', phone: '0912 345 678' },
  { id: null, name: null, phone: null }
]

export const mockAiFlowerDesignComboOptions: AiFlowerDesignComboOption[] = [
  { id: 'combo-1', code: 'HB_CR_2026', name: 'Bó Coral Pink 2026', imageUrl: '/images/auth-bg.jpg' },
  { id: 'combo-2', code: 'HB_TX_2026', name: 'Bó Thanh Xuân 2026', imageUrl: '/images/placeholder-cover.png' },
  { id: 'combo-3', code: 'HL_SN_2026', name: 'Hoa lẵng Sinh Nhật', imageUrl: '/images/taskcoper.png' },
  { id: 'combo-4', code: 'GH_TN_2026', name: 'Giỏ hoa Tốt Nghiệp', imageUrl: '/images/taskcoper-white.png' },
  { id: 'combo-5', code: 'BH_YT_2026', name: 'Bình hoa Yêu Thương', imageUrl: null },
  { id: 'combo-6', code: 'HB_NN_2026', name: 'Bó hoa Ngày Nắng', imageUrl: '/images/auth-bg.jpg' },
  { id: 'combo-7', code: 'GH_HP_2026', name: 'Giỏ hoa Hạnh Phúc', imageUrl: '/images/placeholder-cover.png' },
  { id: 'combo-8', code: 'HL_KT_2026', name: 'Hoa lẵng Khai Trương', imageUrl: '/images/taskcoper.png' },
  { id: 'combo-9', code: 'BH_AT_2026', name: 'Bình hoa An Tĩnh', imageUrl: '/images/taskcoper-white.png' },
  { id: 'combo-10', code: 'HB_MM_2026', name: 'Bó hoa May Mắn', imageUrl: null }
]

const previewImages = [
  'https://i.pinimg.com/736x/78/1e/63/781e6304bc1967c3648de8a5375f9eca.jpg',
  'https://i.pinimg.com/originals/89/13/2c/89132ca5253dc117bbddeaefb7c06092.jpg',
  'https://i.pinimg.com/736x/d5/59/5a/d5595a35c192b0530faba550152da213.jpg',
  'https://i.pinimg.com/736x/b5/20/fe/b520fe497e0da91079444252bae89b7d.jpg',
  'https://reminiscentblooms.com/cdn/shop/products/IMG_49212_2048x.jpg?v=1673324843',
  'https://i.pinimg.com/736x/d4/96/fc/d496fc5e3b65175fd45767e3bb5ea2da.jpg',
  'https://i.pinimg.com/originals/6e/26/1b/6e261b04aefd60a2c4e86e72b4a8143d.jpg'
]

const mockAiFlowerDesigns: AiFlowerDesignHistoryItem[] = Array.from({ length: 42 }, (_, index) => {
  const number = index + 1
  const customer = customers[index % customers.length]
  const combo = mockAiFlowerDesignComboOptions[index % mockAiFlowerDesignComboOptions.length]

  return {
    id: `ai-flower-design-${number}`,
    // Empty outputs are unfinished generations; the broken URL verifies per-preview fallback behavior.
    outputImageUrl:
      index % 13 === 0
        ? null
        : index === 8
          ? '/images/ai-flower-preview-not-found.jpg'
          : previewImages[(index - 1 + previewImages.length) % previewImages.length],
    customerId: customer.id,
    customerName: customer.name,
    customerPhone: customer.phone,
    orderCode: `ORDER-${String(920000 + number)}`,
    sourceComboId: combo.id,
    sourceComboCode: combo.code,
    sourceComboName: combo.name,
    createdAt: new Date(Date.UTC(2026, 7, 29 - index, 8 + (index % 9), 30)).toISOString()
  }
})

const normalizeSearch = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/gi, 'd')
    .toLowerCase()
    .trim()

export const getMockAiFlowerDesignComboOptions = async ({
  pageIndex = 1,
  pageSize = 5,
  search
}: GetAiFlowerDesignComboOptionsParams): Promise<AiFlowerDesignComboOptionsPage> => {
  const normalizedSearch = search ? normalizeSearch(search) : ''
  const filteredCombos = normalizedSearch
    ? mockAiFlowerDesignComboOptions.filter((combo) =>
        [combo.name, combo.code]
          .filter((value): value is string => Boolean(value))
          .some((value) => normalizeSearch(value).includes(normalizedSearch))
      )
    : mockAiFlowerDesignComboOptions
  const safePageSize = Math.max(1, pageSize)
  const totalCount = filteredCombos.length
  const totalPages = Math.max(1, Math.ceil(totalCount / safePageSize))
  const safePageIndex = Math.min(Math.max(1, pageIndex), totalPages)
  const startIndex = (safePageIndex - 1) * safePageSize

  return {
    items: filteredCombos.slice(startIndex, startIndex + safePageSize),
    pageIndex: safePageIndex,
    pageSize: safePageSize,
    totalCount,
    hasNextPage: safePageIndex < totalPages,
    hasPreviousPage: safePageIndex > 1
  }
}

export const getMockAiFlowerDesignDetail = async (id: string): Promise<AiFlowerDesignDetail | null> => {
  const design = mockAiFlowerDesigns.find((item) => item.id === id && Boolean(item.outputImageUrl?.trim()))
  if (!design) return null

  const designNumber = Number(design.id.replace('ai-flower-design-', '')) || 1
  const linkedOrderCount = designNumber % 4

  return {
    ...design,
    customerEmail: design.customerId ? `khachhang${designNumber}@example.com` : null,
    sourceCombo: {
      id: design.sourceComboId,
      code: design.sourceComboCode,
      name: design.sourceComboName ?? '-',
      description: 'Combo hoa được lưu tại thời điểm khách hàng tạo mẫu Custom AI.',
      imageUrl: previewImages[(designNumber + 1) % previewImages.length]
    },
    coreMaterials: [
      {
        id: `core-${designNumber}-1`,
        code: 'HH-HONG-001',
        name: 'Hoa hồng Juliet',
        imageUrl: '/images/placeholder-cover.png',
        unit: 'Cành',
        quantity: 12 + (designNumber % 5)
      },
      {
        id: `core-${designNumber}-2`,
        code: 'HH-CUCA-002',
        name: 'Hoa cúc mẫu đơn',
        imageUrl: '/images/auth-bg.jpg',
        unit: 'Cành',
        quantity: 6 + (designNumber % 3)
      }
    ],
    supportMaterials: [
      {
        id: `support-${designNumber}-1`,
        code: 'PL-LA-001',
        name: 'Lá bạc',
        imageUrl: '/images/placeholder-cover.png',
        unit: 'Cành',
        quantity: 5
      },
      {
        id: `support-${designNumber}-2`,
        code: 'PL-RUYBANG-002',
        name: 'Ruy băng satin',
        imageUrl: null,
        unit: 'Mét',
        quantity: 1.5
      }
    ],
    sourceMockup: {
      id: `mockup-${(designNumber % 4) + 1}`,
      code: `MOCKUP-${String((designNumber % 4) + 1).padStart(3, '0')}`,
      name: `Mockup hoa phong cách ${(designNumber % 4) + 1}`,
      imageUrl: previewImages[(designNumber + 2) % previewImages.length]
    },
    customRequest:
      designNumber % 5 === 0
        ? null
        : 'Ưu tiên tông màu nhẹ, bố cục tự nhiên và giữ phong cách thanh lịch của Combo nguồn.',
    fileStatus:
      designNumber % 7 === 0
        ? AiCardFileStatus.Expired
        : designNumber % 5 === 0
          ? AiCardFileStatus.Processing
          : AiCardFileStatus.Available,
    linkedOrders: Array.from({ length: linkedOrderCount }, (_, index) => ({
      id: `00000000-0000-4000-8000-${String(designNumber * 20 + index).padStart(12, '0')}`,
      code: `ORDER-${String(920000 + designNumber * 10 + index)}`,
      status: index % 2 === 0 ? 'Paid' : 'Pending',
      createdAt: new Date(Date.UTC(2026, 7, 29 - designNumber - index, 10, 30)).toISOString()
    }))
  }
}

export const getMockAiFlowerDesignHistory = async ({
  pageIndex = 1,
  pageSize = 10,
  search,
  comboIds
}: GetAiFlowerDesignHistoryParams): Promise<AiFlowerDesignHistoryPage> => {
  const normalizedSearch = search ? normalizeSearch(search) : ''
  const selectedComboIds = new Set(comboIds ?? [])
  const validOutputDesigns = mockAiFlowerDesigns.filter((design) => Boolean(design.outputImageUrl?.trim()))
  const filteredDesigns = validOutputDesigns.filter((design) => {
    const matchesSearch =
      !normalizedSearch ||
      Boolean(design.customerName && normalizeSearch(design.customerName).includes(normalizedSearch))
    const matchesCombo = selectedComboIds.size === 0 || selectedComboIds.has(design.sourceComboId)

    return matchesSearch && matchesCombo
  })

  const safePageSize = Math.max(1, pageSize)
  const totalCount = filteredDesigns.length
  const totalPages = Math.max(1, Math.ceil(totalCount / safePageSize))
  const safePageIndex = Math.min(Math.max(1, pageIndex), totalPages)
  const startIndex = (safePageIndex - 1) * safePageSize

  return {
    items: filteredDesigns.slice(startIndex, startIndex + safePageSize),
    pageIndex: safePageIndex,
    pageSize: safePageSize,
    totalCount,
    hasNextPage: safePageIndex < totalPages,
    hasPreviousPage: safePageIndex > 1
  }
}
