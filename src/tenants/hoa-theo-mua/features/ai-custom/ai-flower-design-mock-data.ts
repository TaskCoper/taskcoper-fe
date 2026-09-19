import type {
  AiFlowerDesignComboOption,
  AiFlowerDesignComboOptionsPage,
  AiFlowerDesignHistoryPage,
  GeneratedFlowerDetail,
  GeneratedFlowerHistoryItem,
  GetAiFlowerDesignComboOptionsParams,
  GetAiFlowerDesignHistoryParams
} from './types'

export const mockAiFlowerDesignComboOptions: AiFlowerDesignComboOption[] = [
  { id: 'product-1', code: 'COMBO-RED', name: 'Combo A - biến thể đỏ', imageUrl: '/images/auth-bg.jpg' },
  { id: 'product-2', code: 'COMBO-PINK', name: 'Combo B - biến thể hồng', imageUrl: '/images/placeholder-cover.png' },
  { id: 'product-3', code: 'COMBO-WHITE', name: 'Combo C - biến thể trắng', imageUrl: '/images/taskcoper.png' }
]

const previewImages = [
  'https://i.pinimg.com/736x/78/1e/63/781e6304bc1967c3648de8a5375f9eca.jpg',
  'https://i.pinimg.com/originals/89/13/2c/89132ca5253dc117bbddeaefb7c06092.jpg',
  'https://i.pinimg.com/736x/d5/59/5a/d5595a35c192b0530faba550152da213.jpg'
]

const createMockFlower = (index: number): GeneratedFlowerHistoryItem => {
  const number = index + 1
  const product = mockAiFlowerDesignComboOptions[index % mockAiFlowerDesignComboOptions.length]
  const flowerId = `6f0c1e8a-3b72-4d95-a146-${String(number).padStart(12, '0')}`

  return {
    id: flowerId,
    name: number === 1 ? 'Bó hoa hồng đỏ' : `${product.name} - mẫu ${number}`,
    imageUrl: previewImages[index % previewImages.length],
    userId: `770e8400-e29b-41d4-a716-${String(number).padStart(12, '0')}`,
    createdAt: new Date(Date.UTC(2026, 8, 17 - index, 8 + (index % 8), 30)).toISOString(),
    metadata: {
      subId: `440e8400-e29b-41d4-a716-${String(number).padStart(12, '0')}`,
      aiCustomize: true,
      ribbon: {
        id: '660e8400-e29b-41d4-a716-446655440001',
        name: 'Ruy băng lụa đỏ',
        label: 'PHỤ KIỆN, RUY BĂNG',
        imageUrl: '/images/placeholder-cover.png',
        isActive: true,
        isDeleted: false
      },
      wrappingPaper: null,
      materials: [
        { matId: '550e8400-e29b-41d4-a716-446655440001', name: 'Hoa hồng', quantity: 2 + (index % 3), isCore: true },
        { matId: '550e8400-e29b-41d4-a716-446655440002', name: 'Lá bạc', quantity: 1, isCore: false }
      ]
    },
    clientHistory: {
      id: `fc6767a2-caf0-4210-9a2d-df370ae8${String(number).padStart(4, '0')}`,
      userId: `770e8400-e29b-41d4-a716-${String(number).padStart(12, '0')}`,
      type: 'flower',
      systemForm: { type: 'flower', content: 'Prompt tạo hoa đã dùng' },
      metadata: {
        schemaVersion: 3,
        operation: 'create',
        product: {
          name: product.name,
          attributes: {},
          image: { url: product.imageUrl, objectKey: null, versionId: 'v1', sha256: null },
          observedStatus: { isActive: true, isDeleted: false }
        },
        bundle: {
          id: '550e8400-e29b-41d4-a716-446655440098',
          name: 'Bó tròn cổ điển',
          description: 'Bố cục bó tròn',
          image: { url: '/images/placeholder-cover.png' },
          observedStatus: { isActive: true, isDeleted: false }
        },
        mockup: null,
        logoConfig: {},
        regeneratedFromFlowerId: null,
        systemPromptSource: 'current',
        validatedAt: new Date(Date.UTC(2026, 8, 17 - index, 8, 25)).toISOString()
      },
      rootId: `440e8400-e29b-41d4-a716-${String(number).padStart(12, '0')}`,
      createdAt: new Date(Date.UTC(2026, 8, 17 - index, 8, 30)).toISOString(),
      baseId: `440e8400-e29b-41d4-a716-${String(number).padStart(12, '0')}`,
      outputId: flowerId,
      sesionId: `9914e88c-180c-4668-b5d5-${String(number).padStart(12, '0')}`
    }
  }
}

const mockAiFlowerDesigns = Array.from({ length: 42 }, (_, index) => createMockFlower(index))

const normalizeSearch = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()

export const getMockAiFlowerDesignComboOptions = async ({
  pageIndex = 1,
  pageSize = 5,
  search
}: GetAiFlowerDesignComboOptionsParams): Promise<AiFlowerDesignComboOptionsPage> => {
  const normalizedSearch = search ? normalizeSearch(search) : ''
  const filtered = normalizedSearch
    ? mockAiFlowerDesignComboOptions.filter((item) =>
        normalizeSearch(`${item.name} ${item.code ?? ''}`).includes(normalizedSearch)
      )
    : mockAiFlowerDesignComboOptions
  const safePageSize = Math.max(1, pageSize)
  const totalPages = Math.max(1, Math.ceil(filtered.length / safePageSize))
  const safePageIndex = Math.min(Math.max(1, pageIndex), totalPages)
  const startIndex = (safePageIndex - 1) * safePageSize

  return {
    items: filtered.slice(startIndex, startIndex + safePageSize),
    pageIndex: safePageIndex,
    pageSize: safePageSize,
    totalCount: filtered.length,
    hasNextPage: safePageIndex < totalPages,
    hasPreviousPage: safePageIndex > 1
  }
}

export const getMockAiFlowerDesignDetail = async (id: string): Promise<GeneratedFlowerDetail | null> =>
  mockAiFlowerDesigns.find((item) => item.id === id && Boolean(item.imageUrl?.trim())) ?? null

export const getMockAiFlowerDesignHistory = async ({
  pageIndex = 1,
  pageSize = 10,
  search,
  comboIds
}: GetAiFlowerDesignHistoryParams): Promise<AiFlowerDesignHistoryPage> => {
  const normalizedSearch = search ? normalizeSearch(search) : ''
  const selectedComboIds = new Set(comboIds ?? [])
  const filtered = mockAiFlowerDesigns.filter((design) => {
    const productName = design.clientHistory?.metadata?.product?.name ?? ''
    const matchesSearch =
      !normalizedSearch || normalizeSearch(`${design.name} ${productName}`).includes(normalizedSearch)
    const productId = mockAiFlowerDesignComboOptions.find((option) => option.name === productName)?.id
    const matchesCombo = selectedComboIds.size === 0 || (productId ? selectedComboIds.has(productId) : false)

    return matchesSearch && matchesCombo && Boolean(design.imageUrl?.trim())
  })
  const safePageSize = Math.max(1, pageSize)
  const totalPages = Math.max(1, Math.ceil(filtered.length / safePageSize))
  const safePageIndex = Math.min(Math.max(1, pageIndex), totalPages)
  const startIndex = (safePageIndex - 1) * safePageSize

  return {
    items: filtered.slice(startIndex, startIndex + safePageSize),
    pageIndex: safePageIndex,
    pageSize: safePageSize,
    totalCount: filtered.length,
    hasNextPage: safePageIndex < totalPages,
    hasPreviousPage: safePageIndex > 1
  }
}
