import { marketingPostImageRatioCodes, type MarketingPostImageRatio } from '../image-ratios'
import type { MarketingPostRatioRequest } from '../types'
import { MARKETING_POST_MAX_IMAGE_PAIRS } from '../validations'

export interface MarketingGenerateSelection {
  images: { id: string; ratios: MarketingPostImageRatio[] }[]
}

interface MarketingImagePair {
  imageId: string
  ratioCode: MarketingPostRatioRequest['ratioCode']
}

export const toImagePairs = (images: MarketingGenerateSelection['images']): MarketingImagePair[] =>
  images.flatMap((image) =>
    image.ratios.map((ratio) => ({ imageId: image.id, ratioCode: marketingPostImageRatioCodes[ratio] }))
  )

// Backend chỉ nhận 12 cặp mỗi lần gọi, cắt nhiều hơn thì chia thành nhiều lượt nối tiếp
export const toBatches = (pairs: MarketingImagePair[]) =>
  Array.from({ length: Math.ceil(pairs.length / MARKETING_POST_MAX_IMAGE_PAIRS) }, (_, index) =>
    pairs.slice(index * MARKETING_POST_MAX_IMAGE_PAIRS, (index + 1) * MARKETING_POST_MAX_IMAGE_PAIRS)
  )

// Form chọn theo từng ảnh, backend nhận theo từng tỉ lệ - lật lại cho đúng hợp đồng.
// Hai nền tảng cùng một cặp ảnh × tỉ lệ thì backend gộp lại sinh một lần, nên cứ gửi giống nhau.
export const toRatioRequests = (pairs: MarketingImagePair[]) => {
  const imagesByRatio = new Map<string, MarketingPostRatioRequest>()

  pairs.forEach(({ imageId, ratioCode }) => {
    const existing = imagesByRatio.get(ratioCode)

    if (existing) {
      existing.basePostImageIds.push(imageId)

      return
    }

    imagesByRatio.set(ratioCode, { ratioCode, basePostImageIds: [imageId] })
  })

  return [...imagesByRatio.values()]
}
