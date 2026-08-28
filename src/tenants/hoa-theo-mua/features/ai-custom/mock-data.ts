import {
  AiCardFileStatus,
  AiCardWritingMode,
  type AiCardDetail,
  type AiCardHistoryItem,
  type AiCardHistoryPage,
  type GetAiCardHistoryParams
} from './types'

const customers = [
  { id: 'customer-1', name: 'Nguyễn Minh Anh', phone: '0901 234 567' },
  { id: 'customer-2', name: 'Trần Ngọc Mai', phone: '0938 456 789' },
  { id: 'customer-3', name: 'Lê Hoàng Nam', phone: '0987 654 321' },
  { id: 'customer-4', name: 'Phạm Thu Hà', phone: '0912 345 678' },
  { id: null, name: null, phone: null }
]

const templates = [
  { id: 'template-1', name: 'Thanh lịch tối giản' },
  { id: 'template-2', name: 'Hoa pastel' },
  { id: 'template-3', name: 'Chúc mừng rực rỡ' },
  { id: 'template-4', name: 'Cổ điển sang trọng' }
]

export const aiCardSizeOptions = [
  { id: '10x15', name: '10 × 15 cm' },
  { id: '12x18', name: '12 × 18 cm' },
  { id: '15x20', name: '15 × 20 cm' }
]

const previewImages = [
  '/images/auth-bg.jpg',
  '/images/taskcoper.png',
  '/images/placeholder-cover.png',
  '/images/taskcoper-white.png'
]

const mockAiCards: AiCardHistoryItem[] = Array.from({ length: 38 }, (_, index) => {
  const customer = customers[index % customers.length]
  const template = templates[index % templates.length]
  const size = aiCardSizeOptions[index % aiCardSizeOptions.length]
  const number = index + 1

  return {
    id: `ai-card-${number}`,
    code: `CARD-${String(number).padStart(5, '0')}`,
    // Empty output values represent unfinished generations and must not enter the history list.
    outputImageUrl:
      index % 11 === 0
        ? null
        : index === 7
          ? '/images/ai-card-preview-not-found.jpg'
          : previewImages[index % previewImages.length],
    customerId: customer.id,
    customerName: customer.name,
    customerPhone: customer.phone,
    templateId: template.id,
    templateName: template.name,
    sizeId: size.id,
    sizeName: size.name,
    writingMode: index % 2 === 0 ? AiCardWritingMode.Calligraphy : AiCardWritingMode.Typed,
    createdAt: new Date(Date.UTC(2026, 7, 28 - index, 9 + (index % 8), 15)).toISOString()
  }
})

export async function getMockAiCardDetail(id: string): Promise<AiCardDetail | null> {
  const card = mockAiCards.find((item) => item.id === id && Boolean(item.outputImageUrl?.trim()))
  if (!card) return null

  const cardNumber = Number(card.id.replace('ai-card-', '')) || 1
  const linkedOrderCount = cardNumber % 4

  return {
    ...card,
    customerEmail: card.customerId ? `khachhang${cardNumber}@example.com` : null,
    senderName: cardNumber % 5 === 0 ? null : card.customerName,
    recipientName: cardNumber % 3 === 0 ? 'Người thương' : 'Gia đình thân yêu',
    greetingMessage:
      cardNumber % 6 === 0 ? null : 'Chúc bạn luôn rạng rỡ, bình an và gặp thật nhiều điều tốt đẹp trong cuộc sống.',
    attachmentImageUrls: cardNumber % 3 === 0 ? ['/images/auth-bg.jpg', '/images/placeholder-cover.png'] : [],
    fileStatus:
      cardNumber % 7 === 0
        ? AiCardFileStatus.Expired
        : cardNumber % 5 === 0
          ? AiCardFileStatus.Processing
          : AiCardFileStatus.Available,
    linkedOrders: Array.from({ length: linkedOrderCount }, (_, index) => ({
      id: `00000000-0000-4000-8000-${String(cardNumber * 10 + index).padStart(12, '0')}`,
      code: `NHANH-${String(840000 + cardNumber * 10 + index)}`,
      status: index % 2 === 0 ? 'Paid' : 'Pending',
      createdAt: new Date(Date.UTC(2026, 7, 28 - cardNumber - index, 10, 30)).toISOString()
    }))
  }
}

export async function recordMockAiCardDownload(id: string): Promise<boolean> {
  return mockAiCards.some((card) => card.id === id && Boolean(card.outputImageUrl?.trim()))
}

const normalizeSearch = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/gi, 'd')
    .toLowerCase()
    .trim()

export async function getMockAiCardHistory({
  pageIndex = 1,
  pageSize = 10,
  search,
  sizeId,
  writingMode
}: GetAiCardHistoryParams): Promise<AiCardHistoryPage> {
  const normalizedSearch = search ? normalizeSearch(search) : ''
  const validOutputCards = mockAiCards.filter((card) => Boolean(card.outputImageUrl?.trim()))
  const filteredCards = validOutputCards.filter((card) => {
    const matchesSearch =
      !normalizedSearch ||
      [card.code, card.customerName, card.customerPhone, card.templateName]
        .filter((value): value is string => Boolean(value))
        .some((value) => normalizeSearch(value).includes(normalizedSearch))
    const matchesSize = !sizeId || card.sizeId === sizeId
    const matchesWritingMode = !writingMode || card.writingMode === writingMode

    return matchesSearch && matchesSize && matchesWritingMode
  })

  const safePageSize = Math.max(1, pageSize)
  const totalCount = filteredCards.length
  const totalPages = Math.max(1, Math.ceil(totalCount / safePageSize))
  const safePageIndex = Math.min(Math.max(1, pageIndex), totalPages)
  const startIndex = (safePageIndex - 1) * safePageSize

  return {
    items: filteredCards.slice(startIndex, startIndex + safePageSize),
    pageIndex: safePageIndex,
    pageSize: safePageSize,
    totalCount,
    hasNextPage: safePageIndex < totalPages,
    hasPreviousPage: safePageIndex > 1
  }
}
