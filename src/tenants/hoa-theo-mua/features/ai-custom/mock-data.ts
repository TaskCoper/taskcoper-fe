import {
  AiCardFileStatus,
  AiCardWritingMode,
  type AiCardHistoryPage,
  type GeneratedCardDetailItem,
  type GeneratedCardHistoryItem,
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
  'https://casolia.com/img/image18_best-friend-card-ideas_layered-cutouts.jpg',
  'https://casolia.com/img/image10_flower-mothers-day-card-ideas_origami-flower-card.jpg',
  'https://i.pinimg.com/736x/74/4a/02/744a0278421fbc76f2ce8cd551456029.jpg',
  'https://i.pinimg.com/474x/0d/5b/39/0d5b39c9be79efac6465f217dc6f35f2.jpg',
  'https://i.etsystatic.com/53192557/r/il/9da53e/6526748319/il_1140xN.6526748319_4yge.jpg',
  'https://thiepgialong.com/kcfinder/upload/images/thiep-moi-tan-gia-online-03.jpg',
  'https://thiep.softvn.com/data/cards/92723516/92723516.png',
  'https://i.etsystatic.com/37698047/r/il/3eaff9/5473765179/il_fullxfull.5473765179_qj85.jpg'
]

const mockAiCards = Array.from({ length: 38 }, (_, index) => {
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
    writingMode: index % 2 === 0 ? AiCardWritingMode.Calligraphy : AiCardWritingMode.Printed,
    createdAt: new Date(Date.UTC(2026, 7, 28 - index, 9 + (index % 8), 15)).toISOString()
  }
})

const mockGeneratedCards: GeneratedCardHistoryItem[] = Array.from({ length: 38 }, (_, index) => {
  const number = index + 1
  const customer = customers[index % customers.length]
  const template = templates[index % templates.length]
  const size = aiCardSizeOptions[index % aiCardSizeOptions.length]
  const [sizeWidth, sizeHeight] = size.id.split('x').map(Number)

  return {
    historyId: `00000000-0000-4000-8000-${String(1000 + number).padStart(12, '0')}`,
    generatedCardId: `00000000-0000-4000-9000-${String(number).padStart(12, '0')}`,
    content: `AI card ${String(number).padStart(2, '0')}`,
    imageUrl:
      index % 11 === 0
        ? null
        : index === 7
          ? '/images/ai-card-preview-not-found.jpg'
          : previewImages[index % previewImages.length],
    rawImage: null,
    userId: customer.id,
    createdAt: new Date(Date.UTC(2026, 7, 28 - index, 9 + (index % 8), 15)).toISOString(),
    cardType: 'AI',
    formType: index % 2 === 0 ? AiCardWritingMode.Calligraphy : AiCardWritingMode.Printed,
    sizeKey: size.id,
    senderName: customer.name,
    receiverName: index % 3 === 0 ? 'Receiver' : 'Loved one',
    messageContent: 'Wishing you happiness and many wonderful moments.',
    attachedImageUrl: null,
    sizeName: size.name,
    sizeWidth,
    sizeHeight,
    sizeBasePrice: 20000 + (index % 3) * 10000,
    sizeMaxWords: 30,
    wordCount: 10 + (index % 15),
    wordConfigSnapshot: null,
    basePrice: 20000 + (index % 3) * 10000,
    extraPrice: index % 2 === 0 ? 10000 : 0,
    totalPrice: 30000 + (index % 3) * 10000,
    templateName: template.name
  }
})

export const getMockGeneratedCardDetail = async (generatedCardId: string): Promise<GeneratedCardDetailItem | null> => {
  const card = mockGeneratedCards.find((item) => item.generatedCardId === generatedCardId && item.imageUrl?.trim())
  if (!card) return null

  const cardNumber = Number(card.generatedCardId.slice(-12)) || 1
  return {
    ...card,
    orders: Array.from({ length: cardNumber % 4 }, (_, index) => ({
      orderId: `0a000000-0000-4000-8000-${String(cardNumber * 10 + index).padStart(12, '0')}`,
      status: index % 2 === 0 ? 'Paid' : 'Pending',
      totalFee: 520000 + index * 240000
    }))
  }
}

const normalizeSearch = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()

export const getMockAiCardHistory = async ({
  pageIndex = 1,
  pageSize = 10,
  search,
  sizeKey,
  formType
}: GetAiCardHistoryParams): Promise<AiCardHistoryPage> => {
  const normalizedSearch = search ? normalizeSearch(search) : ''
  const filteredCards = mockGeneratedCards.filter((card) => {
    if (!card.imageUrl?.trim()) return false

    const matchesSearch =
      !normalizedSearch ||
      [card.generatedCardId, card.content, card.senderName, card.receiverName, card.templateName]
        .filter((value): value is string => Boolean(value))
        .some((value) => normalizeSearch(value).includes(normalizedSearch))
    const matchesSize = !sizeKey || card.sizeKey === sizeKey
    const matchesFormType = !formType || card.formType === formType

    return matchesSearch && matchesSize && matchesFormType
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

export const getLegacyMockAiCardDetail = async (id: string) => {
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
    attachmentImageUrls:
      cardNumber % 3 === 0
        ? [
            'https://i.etsystatic.com/53192557/r/il/9da53e/6526748319/il_1140xN.6526748319_4yge.jpg',
            'https://thiepgialong.com/kcfinder/upload/images/thiep-moi-tan-gia-online-03.jpg'
          ]
        : [],
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
