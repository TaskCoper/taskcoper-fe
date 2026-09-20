import {
  CardTemplateType,
  type CardTemplateListItem,
  type CardTemplatesPage,
  type ChangeCardTemplateStatusPayload,
  type CreateCardTemplatePayload,
  type GetCardTemplatesParams,
  type UpdateCardTemplatePayload
} from './types'

const previewImages = [
  'https://casolia.com/img/image18_best-friend-card-ideas_layered-cutouts.jpg',
  'https://casolia.com/img/image10_flower-mothers-day-card-ideas_origami-flower-card.jpg',
  'https://i.pinimg.com/736x/74/4a/02/744a0278421fbc76f2ce8cd551456029.jpg',
  'https://i.pinimg.com/474x/0d/5b/39/0d5b39c9be79efac6465f217dc6f35f2.jpg',
  'https://i.etsystatic.com/53192557/r/il/9da53e/6526748319/il_1140xN.6526748319_4yge.jpg',
  'https://thiep.softvn.com/data/cards/92723516/92723516.png'
]

const templatePresets = [
  {
    name: 'Thanh lịch tối giản',
    description:
      'Thiết kế theo phong cách tối giản với bố cục thoáng, khoảng trắng được cân đối hợp lý và các chi tiết trang trí được tiết chế. Mẫu thiệp phù hợp với những lời chúc trang trọng, tinh tế hoặc các dịp cần sự nhẹ nhàng và thanh lịch.'
  },
  {
    name: 'Hoa pastel',
    description:
      'Mẫu thiệp sử dụng bảng màu pastel nhẹ nhàng kết hợp cùng các họa tiết hoa mềm mại, tạo cảm giác ấm áp và dễ chịu. Thiết kế phù hợp cho sinh nhật, ngày kỷ niệm, lời cảm ơn hoặc những dịp đặc biệt cần thể hiện sự quan tâm một cách tinh tế.'
  },
  {
    name: 'Chúc mừng rực rỡ',
    description:
      'Phong cách thiết kế tươi sáng với những gam màu nổi bật và các chi tiết trang trí mang không khí vui vẻ, tích cực. Mẫu thiệp phù hợp cho các dịp chúc mừng thành công, sinh nhật, khai trương hoặc những khoảnh khắc đáng nhớ cần tạo cảm giác sôi động.'
  },
  {
    name: 'Cổ điển sang trọng',
    description:
      'Thiết kế kết hợp đường viền cổ điển, kiểu chữ thanh lịch và bố cục cân đối nhằm tạo cảm giác trang trọng và sang trọng. Mẫu thiệp thích hợp với các lời chúc mang tính nghi lễ, sự kiện quan trọng hoặc những dịp cần thể hiện sự chỉn chu và tinh tế.'
  },
  {
    name: 'Yêu thương dịu dàng',
    description:
      'Mẫu thiệp mang phong cách nhẹ nhàng với màu sắc ấm áp, các chi tiết trang trí mềm mại và bố cục tạo cảm giác gần gũi. Phù hợp để gửi những lời yêu thương, lời cảm ơn hoặc những thông điệp chân thành đến gia đình, người thân và những người đặc biệt.'
  },
  {
    name: 'Sinh nhật vui vẻ',
    description:
      'Mẫu thiệp sinh nhật trẻ trung với màu sắc tươi vui, bố cục linh hoạt và các chi tiết trang trí tạo cảm giác năng động. Thiết kế hỗ trợ nhiều độ dài lời chúc khác nhau, phù hợp để gửi đến bạn bè, người thân hoặc đồng nghiệp trong ngày sinh nhật.'
  }
]

let mockCardTemplates: CardTemplateListItem[] = Array.from({ length: 27 }, (_, index) => {
  const number = index + 1
  const preset = templatePresets[index % templatePresets.length]

  return {
    id: `card-template-${number}`,
    name: `${preset.name} ${String(number).padStart(2, '0')}`,
    imageUrl: index === 8 ? '/images/card-template-preview-not-found.jpg' : previewImages[index % previewImages.length],
    description: preset.description,
    isActive: index % 4 !== 0,
    templateType: CardTemplateType.Ai,
    createdAt: new Date(Date.now() - index * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - index * 3600000).toISOString()
  }
})

export const createMockCardTemplate = async (payload: CreateCardTemplatePayload): Promise<CardTemplateListItem> => {
  const template: CardTemplateListItem = {
    id: `card-template-${crypto.randomUUID()}`,
    name: payload.name.trim(),
    description: payload.description?.trim() || null,
    imageUrl: payload.imageUrl,
    isActive: false,
    templateType: payload.templateType,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }

  mockCardTemplates = [template, ...mockCardTemplates]
  return template
}

export const updateMockCardTemplate = async (payload: UpdateCardTemplatePayload): Promise<CardTemplateListItem> => {
  const templateIndex = mockCardTemplates.findIndex((template) => template.id === payload.id)
  if (templateIndex < 0) throw new Error('Card template not found')

  const currentTemplate = mockCardTemplates[templateIndex]
  const updatedTemplate: CardTemplateListItem = {
    ...currentTemplate,
    name: payload.name?.trim() || currentTemplate.name,
    description: payload.description === undefined ? currentTemplate.description : payload.description?.trim() || null,
    imageUrl: payload.imageUrl ?? currentTemplate.imageUrl,
    updatedAt: new Date().toISOString()
  }

  mockCardTemplates = mockCardTemplates.map((template) =>
    template.id === updatedTemplate.id ? updatedTemplate : template
  )
  return updatedTemplate
}

export const changeMockCardTemplateStatus = async (
  payload: ChangeCardTemplateStatusPayload
): Promise<CardTemplateListItem> => {
  const template = mockCardTemplates.find((item) => item.id === payload.id)
  if (!template) throw new Error('Card template not found')

  const updatedTemplate = { ...template, isActive: payload.isActive }
  mockCardTemplates = mockCardTemplates.map((item) => (item.id === payload.id ? updatedTemplate : item))
  return updatedTemplate
}

export const deleteMockCardTemplate = async (id: string): Promise<void> => {
  const templateExists = mockCardTemplates.some((template) => template.id === id)
  if (!templateExists) throw new Error('Card template not found')

  mockCardTemplates = mockCardTemplates.filter((template) => template.id !== id)
}

export const getMockCardTemplates = async ({
  pageIndex = 1,
  pageSize = 10,
  search,
  isActive,
  templateType
}: GetCardTemplatesParams): Promise<CardTemplatesPage> => {
  const normalizedSearch = search?.trim().toLocaleLowerCase('vi') ?? ''
  const filteredTemplates = mockCardTemplates.filter((template) => {
    const matchesSearch = !normalizedSearch || template.name.toLocaleLowerCase('vi').includes(normalizedSearch)
    const matchesStatus = isActive === undefined || template.isActive === isActive
    const matchesTemplateType = templateType === undefined || template.templateType === templateType

    return matchesSearch && matchesStatus && matchesTemplateType
  })
  const safePageSize = Math.max(1, pageSize)
  const totalCount = filteredTemplates.length
  const totalPages = Math.max(1, Math.ceil(totalCount / safePageSize))
  const safePageIndex = Math.min(Math.max(1, pageIndex), totalPages)
  const startIndex = (safePageIndex - 1) * safePageSize

  return {
    items: filteredTemplates.slice(startIndex, startIndex + safePageSize),
    pageIndex: safePageIndex,
    pageSize: safePageSize,
    totalCount,
    hasNextPage: safePageIndex < totalPages,
    hasPreviousPage: safePageIndex > 1
  }
}
