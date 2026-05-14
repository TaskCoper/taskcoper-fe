import type { NewsArticle, NewsCategory, NewsSource } from './types'

// Real Vietnamese startup / entrepreneurship articles, with cover images hot-linked from
// each publisher's CDN. Sources: VnExpress, CafeBiz, TheLEADER.
// Each article links out to the original publisher.

const SOURCES: Record<'vnexpress' | 'cafebiz' | 'theleader', NewsSource> = {
  vnexpress: {
    id: 'src-vnexpress',
    name: 'VnExpress Kinh doanh',
    shortName: 'VnExpress',
    logoUrl: null,
    fallback: 'VN',
    accentClassName: 'bg-slate-900 text-white',
    homepageUrl: 'https://vnexpress.net/kinh-doanh/khoi-nghiep'
  },
  cafebiz: {
    id: 'src-cafebiz',
    name: 'CafeBiz',
    shortName: 'CafeBiz',
    logoUrl: null,
    fallback: 'CB',
    accentClassName: 'bg-slate-900 text-white',
    homepageUrl: 'https://cafebiz.vn'
  },
  theleader: {
    id: 'src-theleader',
    name: 'TheLEADER',
    shortName: 'TheLEADER',
    logoUrl: null,
    fallback: 'TL',
    accentClassName: 'bg-slate-900 text-white',
    homepageUrl: 'https://theleader.vn'
  }
}

const CATEGORIES: Record<string, NewsCategory> = {
  startup: {
    id: 'cat-startup',
    name: 'Khởi nghiệp',
    slug: 'khoi-nghiep',
    textClassName: 'text-emerald-600',
    bgClassName: 'bg-emerald-500',
    softBgClassName: 'bg-emerald-50 text-emerald-700'
  },
  fundraising: {
    id: 'cat-fundraising',
    name: 'Gọi vốn',
    slug: 'goi-von',
    textClassName: 'text-blue-600',
    bgClassName: 'bg-blue-600',
    softBgClassName: 'bg-blue-50 text-blue-700'
  },
  product: {
    id: 'cat-product',
    name: 'Sản phẩm',
    slug: 'san-pham',
    textClassName: 'text-teal-600',
    bgClassName: 'bg-teal-500',
    softBgClassName: 'bg-teal-50 text-teal-700'
  },
  growth: {
    id: 'cat-growth',
    name: 'Tăng trưởng',
    slug: 'tang-truong',
    textClassName: 'text-cyan-600',
    bgClassName: 'bg-cyan-500',
    softBgClassName: 'bg-cyan-50 text-cyan-700'
  },
  ops: {
    id: 'cat-ops',
    name: 'Vận hành',
    slug: 'van-hanh',
    textClassName: 'text-indigo-600',
    bgClassName: 'bg-indigo-500',
    softBgClassName: 'bg-indigo-50 text-indigo-700'
  },
  story: {
    id: 'cat-story',
    name: 'Câu chuyện',
    slug: 'cau-chuyen',
    textClassName: 'text-orange-600',
    bgClassName: 'bg-orange-500',
    softBgClassName: 'bg-orange-50 text-orange-700'
  },
  mindset: {
    id: 'cat-mindset',
    name: 'Tư duy',
    slug: 'tu-duy',
    textClassName: 'text-violet-600',
    bgClassName: 'bg-violet-500',
    softBgClassName: 'bg-violet-50 text-violet-700'
  }
}

export const FEATURED_ARTICLES: NewsArticle[] = [
  {
    id: 'a-001',
    slug: 'de-che-1-8-ty-usd-2-nhan-vien-ai',
    title: 'Đế chế 1,8 tỷ USD chỉ có 2 nhân viên: khi AI không còn là công cụ mà là "linh hồn" doanh nghiệp',
    excerpt:
      'Startup Medvi chỉ có 2 nhân viên nhưng đạt doanh thu dự kiến 1,8 tỷ USD trong năm 2026 nhờ AI thay thế toàn bộ các phòng ban truyền thống — minh chứng sống cho dự đoán của Sam Altman về các công ty "một thành viên" trị giá tỷ USD.',
    coverUrl:
      'https://cafebiz.cafebizcdn.vn/162123310254002176/2026/5/8/screenshot-2026-05-08-142927-1778225547159-1778225547782176967511.png',
    source: SOURCES.cafebiz,
    category: CATEGORIES.product,
    readTimeMinutes: 7,
    publishedAt: '2026-05-08T14:30:00+07:00',
    url: 'https://cafebiz.vn/de-che-18-ty-usd-chi-co-2-nhan-vien-lam-viec-tuong-duong-2400-nguoi-khi-ai-khong-con-la-cong-cu-ma-la-linh-hon-cua-doanh-nghiep-176260508143411012.chn'
  },
  {
    id: 'a-002',
    slug: 'ceo-coolmate-goi-von-22-trieu-usd-2025',
    title:
      'CEO Coolmate Phạm Chí Nhu: startup gọi vốn nhiều nhất 2025 và tham vọng đưa thời trang Việt sánh ngang Uniqlo',
    excerpt:
      'Phạm Chí Nhu, CEO sinh năm 1991 của Coolmate, hoàn thành vòng Series B+ trị giá 22,34 triệu USD — vòng gọi vốn lớn nhất năm 2025. Coolmate hiện phục vụ 1,2 triệu khách hàng và bắt đầu mở rộng ra thị trường quốc tế.',
    coverUrl:
      'https://cafebiz.cafebizcdn.vn/162123310254002176/2026/2/24/thiet-ke-chua-co-ten-2026-02-24t092613-167-17718999865861353211167-1771901347266-17719013479502048865661.png',
    source: SOURCES.cafebiz,
    category: CATEGORIES.fundraising,
    readTimeMinutes: 6,
    publishedAt: '2026-02-24T09:51:00+07:00',
    url: 'https://cafebiz.vn/ceo-sinh-nam-1991-dung-sau-startup-goi-von-nhieu-nhat-2025-khach-hang-ung-ho-vi-muon-thoi-trang-viet-vuon-xa-nhu-uniqlo-adidas-va-nike-176260224095131297.chn'
  },
  {
    id: 'a-003',
    slug: 'startup-ai-top-10-he-sinh-thai-tp-hcm',
    title: 'Startup AI Hay lọt top 10 hệ sinh thái khởi nghiệp TP HCM',
    excerpt:
      'AI Hay — phần mềm do kỹ sư Việt phát triển — đạt 489 điểm trong bảng xếp hạng StartupBlink 2026, đứng top 10 hệ sinh thái khởi nghiệp TP HCM và dẫn đầu mảng AI tại thành phố.',
    coverUrl:
      'https://i2-vnexpress.vnecdn.net/2026/01/27/DSC01247-5612-1769449166.jpg?w=1200&h=0&q=100&dpr=1&fit=crop&s=kib6b7h0Q3uYopQwtjQ0fg',
    source: SOURCES.vnexpress,
    category: CATEGORIES.product,
    readTimeMinutes: 5,
    publishedAt: '2026-01-27T10:34:00+07:00',
    url: 'https://vnexpress.net/startup-ai-vao-top-10-he-sinh-thai-khoi-nghiep-tp-hcm-5010257.html'
  },
  {
    id: 'a-004',
    slug: 'viet-nam-huong-toi-mo-hinh-toan-dan-khoi-nghiep',
    title: 'Việt Nam hướng tới mô hình "toàn dân khởi nghiệp"',
    excerpt:
      'Thứ trưởng Khoa học và Công nghệ Hoàng Minh nhấn mạnh cần một chiến lược quốc gia về khởi nghiệp sáng tạo. Chính phủ đã lập quỹ đầu tư mạo hiểm cấp quốc gia và sắp ra mắt sàn giao dịch chứng khoán chuyên biệt cho startup.',
    coverUrl:
      'https://i2-vnexpress.vnecdn.net/2025/12/13/lq-05801-2-7587-1765605818-176-6862-4670-1765607315.jpg?w=1200&h=0&q=100&dpr=1&fit=crop&s=z3xI6T9KPgaIxPuY5EsoTQ',
    source: SOURCES.vnexpress,
    category: CATEGORIES.startup,
    readTimeMinutes: 6,
    publishedAt: '2025-12-13T13:28:00+07:00',
    url: 'https://vnexpress.net/viet-nam-huong-toi-mo-hinh-toan-dan-khoi-nghiep-4993422.html'
  },
  {
    id: 'a-005',
    slug: 'sao-mai-education-vietnam-2026',
    title: 'Từ Education Vietnam 2026 đến thị trường thật: câu chuyện của Sao Mai Education Group',
    excerpt:
      'Sau triển lãm Education Vietnam 2026, thị trường edtech Việt Nam chuyển dịch từ mua sắm thiết bị sang đầu tư hệ sinh thái giáo dục thông minh tích hợp AI — đặt ra yêu cầu cao hơn về năng lực triển khai dài hạn.',
    coverUrl:
      'https://cafebiz.cafebizcdn.vn/thumb_w/640/162123310254002176/2026/5/9/photo1778318064248-1778318064415499069031-1778338265064933581128.jpg',
    source: SOURCES.cafebiz,
    category: CATEGORIES.growth,
    readTimeMinutes: 5,
    publishedAt: '2026-05-09T21:51:00+07:00',
    url: 'https://cafebiz.vn/tu-education-vietnam-2026-den-thi-truong-that-cau-chuyen-thanh-cong-cua-sao-mai-education-group-176260509215103581.chn'
  }
]

export const LATEST_ARTICLES: NewsArticle[] = [
  {
    id: 'a-101',
    slug: '7-mo-hinh-kinh-doanh-nho-von-thap-2026',
    title: '7 mô hình kinh doanh nhỏ vốn thấp năm 2026: không cần kinh nghiệm vẫn có thể tạo dòng tiền',
    excerpt:
      'Trong bối cảnh chi phí sinh hoạt ngày càng tăng, nhiều người tìm cách tạo thêm thu nhập mà không cần vốn lớn hay kinh nghiệm trước đó — bài viết liệt kê 7 hướng đi khả thi.',
    coverUrl:
      'https://cafebiz.cafebizcdn.vn/162123310254002176/2026/4/13/chatgpt-image-104803-10-thg-4-2026-17757929325831706369684-1775814327631-1775814327833952929233-1776053953224-1776053953497172719342.png',
    source: SOURCES.cafebiz,
    category: CATEGORIES.startup,
    readTimeMinutes: 6,
    publishedAt: '2026-04-13T11:19:00+07:00',
    url: 'https://cafebiz.vn/7-mo-hinh-kinh-doanh-nho-von-thap-nam-2026-khong-can-kinh-nghiem-van-co-the-tao-dong-tien-176260413111928916.chn'
  },
  {
    id: 'a-102',
    slug: 'hanh-trinh-trai-nghiem-doanh-nhan-2026',
    title: 'Những hành trình đáng trải nghiệm cho doanh nhân năm 2026',
    excerpt:
      'Năm 2026, doanh nhân tìm đến những hành trình chậm rãi để tìm lại bản thân và nuôi dưỡng phong cách sống bền vững, kết nối con người với thiên nhiên và di sản.',
    coverUrl: 'https://i.ex-cdn.com/theleader.vn/files/news/2026/02/12/pham-ha-1421.jpg',
    source: SOURCES.theleader,
    category: CATEGORIES.mindset,
    readTimeMinutes: 4,
    publishedAt: '2026-02-19T09:32:00+07:00',
    url: 'https://theleader.vn/nhung-hanh-trinh-dang-trai-nghiem-cho-doanh-nhan-nam-2026-d44353.html'
  },
  {
    id: 'a-103',
    slug: 'startup-sinh-ton-mua-dong-goi-von',
    title: 'Startup tìm cách sinh tồn giữa mùa đông gọi vốn',
    excerpt:
      'Trong mùa đông gọi vốn, các startup cần xây dựng nội lực và quan hệ với nhà đầu tư. Chỉ 0,5–1% startup được rót vốn; founder phải hiểu nhu cầu thoái vốn và lợi nhuận của nhà đầu tư để thành công.',
    coverUrl:
      'https://i.ex-cdn.com/theleader.vn/files/news/2024/10/28/z5975432099048_5a114ca8cca9b5f526179c19f426531c-1514.jpg',
    source: SOURCES.theleader,
    category: CATEGORIES.fundraising,
    readTimeMinutes: 7,
    publishedAt: '2024-10-28T17:15:00+07:00',
    url: 'https://theleader.vn/startup-tim-cach-sinh-ton-giua-mua-dong-goi-von-d37661.html'
  },
  {
    id: 'a-104',
    slug: 'startup-nen-hoi-doanh-nghiep-can-gi-de-khoi-nghiep-ai',
    title: '"Startup nên hỏi doanh nghiệp cần gì để khởi nghiệp AI"',
    excerpt:
      'Các chuyên gia khuyên startup AI nên tiếp cận trực tiếp doanh nghiệp để giải quyết bài toán thực tế — vừa tạo doanh thu sớm vừa hiểu nhu cầu thị trường thay vì xây sản phẩm chưa chắc hợp lệ.',
    coverUrl:
      'https://i1-kinhdoanh.vnecdn.net/2025/07/23/1753172861977-qdi-0271-jpg-175-7433-1440-1753210506.jpg?w=1200&h=0&q=100&dpr=1&fit=crop&s=huoKPOs-MpKG41-k5LKRCQ',
    source: SOURCES.vnexpress,
    category: CATEGORIES.product,
    readTimeMinutes: 5,
    publishedAt: '2025-07-23T02:47:00+07:00',
    url: 'https://vnexpress.net/startup-nen-hoi-doanh-nghiep-can-gi-de-khoi-nghiep-ai-4917587.html'
  },
  {
    id: 'a-105',
    slug: 'founder-100-startup-diem-chung-thanh-cong',
    title: 'Đầu tư cho hơn 100 founder, một CEO chỉ ra đặc điểm chung của những người thành đạt nhất dưới 25 tuổi',
    excerpt:
      'Josh Browder, doanh nhân 28 tuổi đã đầu tư vào hơn 100 nhà sáng lập trẻ, xác định rằng "mối liên hệ sâu sắc" với vấn đề mà công ty giải quyết là yếu tố quan trọng nhất dự đoán thành công.',
    coverUrl:
      'https://cafebiz.cafebizcdn.vn/162123310254002176/2025/7/8/108163491-1750798917078-joshuabrowder-1751941427475-1751941430742834733822.jpg',
    source: SOURCES.cafebiz,
    category: CATEGORIES.mindset,
    readTimeMinutes: 6,
    publishedAt: '2025-07-08T09:25:00+07:00',
    url: 'https://cafebiz.vn/dau-tu-cho-hon-100-founder-startup-vi-ceo-chi-ra-nguoi-thanh-dat-nhat-duoi-25-tuoi-deu-co-chung-mot-dac-diem-17625070809254853.chn'
  },
  {
    id: 'a-106',
    slug: 'the-gioi-startup-khac-nghiet-founder-18-tieng',
    title: 'Thế giới startup khắc nghiệt: founder làm 18 tiếng/ngày suốt 7 tháng, bỏ cả vệ sinh cá nhân',
    excerpt:
      'Một đồng sáng lập Vaani Research Labs làm việc 18 tiếng mỗi ngày trong 7 tháng để phát triển hệ thống AI giọng nói. Chia sẻ của ông gây tranh cãi về văn hóa làm việc độc hại trong giới khởi nghiệp.',
    coverUrl:
      'https://cafebiz.cafebizcdn.vn/162123310254002176/2024/10/5/screenshot-2024-10-05-at-082925-1728104199848-17281042009791813032003.png',
    source: SOURCES.cafebiz,
    category: CATEGORIES.mindset,
    readTimeMinutes: 5,
    publishedAt: '2024-10-05T11:57:00+07:00',
    url: 'https://cafebiz.vn/the-gioi-startup-khac-nghiet-founder-suot-7-thang-dien-cuong-lam-viec-lien-tuc-18-tieng-bo-qua-ca-ve-sinh-ca-nhan-176241005115706478.chn'
  },
  {
    id: 'a-107',
    slug: 'nu-founder-goi-von-may-man',
    title: 'Nữ founder đi gọi vốn: làm việc 16 tiếng/ngày suốt 3–4 năm vẫn bị coi là do "may mắn"?',
    excerpt:
      'Nữ founder Annie Vũ chia sẻ những thách thức riêng phụ nữ gặp phải khi gọi vốn và phát triển startup — bao gồm việc nỗ lực bị quy về "may mắn" thay vì công lao thực sự.',
    coverUrl: 'https://cafebiz.cafebizcdn.vn/thumb_w/640/162123310254002176/2024/5/21/ye-ye-1716315293815526726549.jpg',
    source: SOURCES.cafebiz,
    category: CATEGORIES.story,
    readTimeMinutes: 5,
    publishedAt: '2024-05-22T01:16:00+07:00',
    url: 'https://cafebiz.vn/nu-founder-di-goi-von-lam-viec-16-tieng-ngay-lien-tuc-trong-vong-3-4-nam-van-bi-coi-la-do-may-man-176240522011643381.chn'
  },
  {
    id: 'a-108',
    slug: 'hon-4-6-ty-usd-do-vao-startup-viet',
    title: 'Hơn 4,6 tỷ USD đổ vào các startup Việt Nam trong 10 năm qua',
    excerpt:
      'Giai đoạn 2014–2023, hơn 4,6 tỷ USD được đầu tư vào các công ty khởi nghiệp Việt Nam qua 835 thương vụ, với năm 2021 ghi nhận lượng vốn cao nhất.',
    coverUrl:
      'https://i1-kinhdoanh.vnecdn.net/2024/04/26/startuo-1714116554-1714116579-2133-1714116603.jpg?w=1200&h=0&q=100&dpr=1&fit=crop&s=3f7RDpi0xa6isblNfOEyJA',
    source: SOURCES.vnexpress,
    category: CATEGORIES.fundraising,
    readTimeMinutes: 4,
    publishedAt: '2024-04-27T08:19:00+07:00',
    url: 'https://vnexpress.net/hon-4-6-ty-usd-do-vao-cac-startup-viet-nam-chuc-nam-qua-4739189.html'
  },
  {
    id: 'a-109',
    slug: 'ceo-stringee-hanh-trinh-cong-nghe-viet',
    title: 'CEO Stringee và hành trình tạo thêm giá trị cho công nghệ Việt',
    excerpt:
      'Đậu Ngọc Huy kể về hành trình xây dựng Stringee từ một ứng dụng chat thất bại thành nền tảng lập trình giao tiếp hàng đầu Việt Nam, vượt qua khó khăn tài chính để tạo giá trị cho doanh nghiệp.',
    coverUrl: 'https://i.ex-cdn.com/theleader.vn/files/f1/Upload_vn/hungnguyen/2020/11/18/T1.jpg',
    source: SOURCES.theleader,
    category: CATEGORIES.story,
    readTimeMinutes: 6,
    publishedAt: '2020-11-18T09:00:00+07:00',
    url: 'https://theleader.vn/ceo-stringee-va-hanh-trinh-tao-them-gia-tri-cho-cong-nghe-viet-m1605671152352.htm'
  }
]

export const ALL_CATEGORIES: NewsCategory[] = Object.values(CATEGORIES)
