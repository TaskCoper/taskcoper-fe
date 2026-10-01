import { marketingPostImageRatioSizes, type MarketingPostImageRatio } from './image-ratios'
import {
  MarketingPostChannel,
  MarketingPostStatus,
  type MarketingPostDetail,
  type MarketingPostSource,
  type UpdateMarketingPostBody,
  type MarketingPostItem
} from './types'

const topics = [
  'Khai trương cửa hàng Hoa Theo Mùa',
  'Ưu đãi 20/10 - Tặng thiệp viết tay',
  'Bộ sưu tập hoa cưới mùa thu',
  'Hướng dẫn giữ hoa tươi lâu 7 ngày',
  'Giỏ hoa chúc mừng khai trương',
  'Combo hoa và quà tặng doanh nghiệp',
  'Hoa sinh nhật giao nhanh 2 giờ',
  'Câu chuyện đằng sau mỗi bó hoa'
]

// Ảnh mock cố tình đủ tỉ lệ: vuông, ngang, dọc, panorama, story dọc dài
// để soát layout thumbnail (crop object-cover) và lightbox (giữ tỉ lệ gốc)
const thumbnails = [
  'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?w=1080&h=1080&fit=crop',
  'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=1200&h=630&fit=crop',
  'https://images.unsplash.com/photo-1487070183336-b863922373d4?w=1080&h=1350&fit=crop',
  'https://images.unsplash.com/photo-1508610048659-a06b669e3321?w=1080&h=1920&fit=crop',
  'https://images.unsplash.com/photo-1563241527-3004b7be0ffd?w=1600&h=900&fit=crop',
  'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=1600&h=600&fit=crop',
  'https://images.unsplash.com/photo-1519378058457-4c29a0a2efac?w=800&h=1200&fit=crop',
  'https://images.unsplash.com/photo-1464982326199-86f32f81b211?w=900&h=1600&fit=crop'
]

export const marketingPostChannels = [
  MarketingPostChannel.Facebook,
  MarketingPostChannel.Instagram,
  MarketingPostChannel.ZaloOa
]

export const marketingPostStatuses = [
  MarketingPostStatus.Draft,
  MarketingPostStatus.Scheduled,
  MarketingPostStatus.Published,
  MarketingPostStatus.Failed
]

const mockMarketingPosts: MarketingPostItem[] = Array.from({ length: 34 }, (_, index) => {
  const number = index + 1
  const topic = topics[index % topics.length]
  const status = marketingPostStatuses[index % marketingPostStatuses.length]
  const createdAt = new Date(Date.UTC(2026, 8, 11 - (index % 25), 3, 30)).toISOString()

  return {
    id: `marketing-post-${number}`,
    title: `${topic} #${number}`,
    excerpt: `${topic} - nội dung do AI soạn, đã được đội marketing duyệt lại trước khi lên lịch đăng.`,
    // Bài nháp được tạo trước bước sinh ảnh nên chưa có thumbnail
    thumbnailUrl: status === MarketingPostStatus.Draft ? null : thumbnails[index % thumbnails.length],
    channel: marketingPostChannels[index % marketingPostChannels.length],
    status,
    publishedAt:
      status === MarketingPostStatus.Draft
        ? null
        : new Date(Date.UTC(2026, 8, 11 - (index % 25), 1, (index % 4) * 15)).toISOString(),
    createdAt
  }
})

// Ảnh gốc do người dùng tải lên - tỉ lệ máy ảnh/điện thoại, chưa cắt theo nền tảng
const sourceImages = [
  'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?w=1600&h=1200&fit=crop',
  'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=1200&h=1600&fit=crop',
  'https://images.unsplash.com/photo-1487070183336-b863922373d4?w=1500&h=1000&fit=crop'
]

const channelPostUrls: Record<MarketingPostChannel, string> = {
  [MarketingPostChannel.Facebook]: 'https://facebook.com/hoatheomua/posts/',
  [MarketingPostChannel.Instagram]: 'https://instagram.com/p/',
  [MarketingPostChannel.ZaloOa]: 'https://zalo.me/hoatheomua/'
}

// Ảnh AI cắt ra cho một cặp (ảnh gốc, tỉ lệ). Studio dựng pool ảnh dùng chung từ hàm này.
// `attempt` tăng mỗi lần admin bảo cắt lại, đổi luôn ảnh nền để nhìn ra ngay là bản mới.
export const buildMockGeneratedImageUrl = (
  sourceIndex: number,
  ratio: MarketingPostImageRatio,
  attempt: number = 0
) => {
  const { width, height } = marketingPostImageRatioSizes[ratio]
  const baseImage = thumbnails[(sourceIndex + attempt) % thumbnails.length].split('?')[0]

  return `${baseImage}?w=${width}&h=${height}&fit=crop`
}

// Bản chỉnh tay đè lên nội dung AI gen. Thay bằng PUT khi có API.
const marketingPostEdits = new Map<string, UpdateMarketingPostBody & { updatedAt: string }>()

// Nội dung gốc của bài được tạo từ form, thay bằng field của API khi có backend
const marketingPostSources = new Map<string, MarketingPostSource>()
const marketingPostGeneratedImages = new Map<string, string[]>()

let mockPostSequence = mockMarketingPosts.length

// Studio chốt xong mới đẩy bài vào danh sách: mỗi kênh một bài, trạng thái tuỳ hành động admin chọn
export const createMockMarketingPostRecord = ({
  title,
  channel,
  status,
  publishedAt,
  content,
  hashtags,
  imageUrls,
  source
}: {
  title: string
  channel: MarketingPostChannel
  status: MarketingPostStatus
  publishedAt: string | null
  content: string
  hashtags: string[]
  imageUrls: string[]
  source: MarketingPostSource
}): string => {
  const createdAt = new Date().toISOString()
  mockPostSequence += 1
  const id = `marketing-post-${mockPostSequence}`

  mockMarketingPosts.unshift({
    id,
    title,
    excerpt: content.split('\n')[0]?.trim() || title,
    thumbnailUrl: imageUrls[0] ?? null,
    channel,
    status,
    publishedAt,
    createdAt
  })
  marketingPostSources.set(id, source)
  marketingPostGeneratedImages.set(id, imageUrls)
  marketingPostEdits.set(id, { content, hashtags, updatedAt: createdAt })

  return id
}

// Studio lưu lại nguyên bài: chữ nghĩa, ảnh đã chọn và cả trạng thái đăng.
export const updateMockMarketingPostRecord = ({
  id,
  content,
  hashtags,
  imageUrls,
  status,
  publishedAt
}: {
  id: string
  content: string
  hashtags: string[]
  imageUrls: string[]
  status: MarketingPostStatus
  publishedAt: string | null
}): boolean => {
  const post = mockMarketingPosts.find((item) => item.id === id)
  if (!post) return false

  post.excerpt = content.split('\n')[0]?.trim() || post.excerpt
  post.thumbnailUrl = imageUrls[0] ?? null
  post.status = status
  post.publishedAt = publishedAt

  marketingPostEdits.set(id, { content, hashtags, updatedAt: new Date().toISOString() })
  marketingPostGeneratedImages.set(id, imageUrls)

  return true
}

export const getMockMarketingPostDetail = async (id: string): Promise<MarketingPostDetail | null> => {
  const post = mockMarketingPosts.find((item) => item.id === id)
  if (!post) return null

  const postNumber = Number(post.id.replace('marketing-post-', '')) || 1
  const edit = marketingPostEdits.get(id)

  return {
    ...post,
    content:
      edit?.content ??
      [
        post.excerpt,
        'Hoa Theo Mùa chọn từng bông theo mùa, bó tay trong ngày và giao tận nơi trong 2 giờ nội thành.',
        'Đặt hàng qua website hoặc nhắn tin trực tiếp để được tư vấn mẫu phù hợp nhất.'
      ].join('\n\n'),
    hashtags: edit?.hashtags ?? (postNumber % 4 === 0 ? [] : ['#hoatheomua', '#hoatuoi', '#giaohoanhanh']),
    imageUrls:
      marketingPostGeneratedImages.get(id) ??
      (post.thumbnailUrl
        ? [post.thumbnailUrl, ...thumbnails.filter((url) => url !== post.thumbnailUrl).slice(0, postNumber % 3)]
        : []),
    channelPostUrl:
      post.status === MarketingPostStatus.Published ? `${channelPostUrls[post.channel]}${postNumber}` : null,
    failureReason:
      post.status === MarketingPostStatus.Failed
        ? 'Kênh từ chối bài đăng: token kết nối đã hết hạn, cần kết nối lại tài khoản.'
        : null,
    updatedAt: edit?.updatedAt ?? new Date(Date.UTC(2026, 8, 11 - (postNumber % 25), 6, 15)).toISOString(),
    source: marketingPostSources.get(id) ?? {
      // Người dùng gõ mộc, chưa qua AI: không hashtag, không chia đoạn theo chuẩn nền tảng
      content: `${post.title}. Cần bài giới thiệu ngắn, nhấn vào chuyện hoa cắt theo mùa và giao trong 2 giờ.`,
      // Ảnh gốc người dùng tải lên - tỉ lệ tuỳ máy chụp, chưa cắt theo nền tảng
      imageUrls: sourceImages.slice(0, (postNumber % 3) + 1),
      createdAt: post.createdAt
    }
  }
}

// Báo cáo đọc thẳng từ kho bài đang có. Trả bản sao để nơi gọi không lỡ tay sửa vào kho.
export const listMockMarketingPosts = (): MarketingPostItem[] => [...mockMarketingPosts]
