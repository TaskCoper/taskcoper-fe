import { type B2BOverview } from '../../types'

export const B2B_OVERVIEW_PRESET: B2BOverview = {
  hero: {
    eyebrow: { vi: 'Hoa Theo Mùa cho Doanh nghiệp', en: 'Hoa Theo Mùa for Business' },
    title: {
      vi: 'Đối Tác Hoa Tinh Tế Cho Doanh Nghiệp & Tổ Chức',
      en: 'A Refined Floral Partner For Businesses & Organizations'
    },
    subtitle: {
      vi: 'Từ phòng họp đến đại sảnh - chúng tôi kiến tạo trải nghiệm hoa cho khách sạn, văn phòng và thương hiệu yêu thích sự chuẩn mực và đẳng cấp.',
      en: 'From boardrooms to grand lobbies - we craft floral experiences for hotels, offices and brands that value craft and consistency.'
    },
    audienceLine: {
      vi: 'Dành cho khách sạn 4–5 sao, văn phòng và thương hiệu đang tìm một đối tác hoa vận hành dài hạn.',
      en: 'For 4–5 star hotels, offices and brands looking for a long-term floral partner.'
    },
    primaryCta: { vi: 'Nhận báo giá', en: 'Request a quote' },
    secondaryCta: { vi: 'Trao đổi cùng đội ngũ', en: 'Talk to our team' },
    imageAlt: { vi: 'Tác phẩm hoa cao cấp cho doanh nghiệp', en: 'Premium corporate floral arrangement' },
    image: '/images/b2b/case-studies/indigo/20.jpg'
  },
  trustBar: {
    eyebrow: { vi: 'Được tin tưởng bởi các thương hiệu hàng đầu', en: 'Trusted by leading brands' },
    stats: [
      {
        id: 'clients',
        value: { vi: '50+', en: '50+' },
        label: { vi: 'Khách hàng doanh nghiệp', en: 'Corporate clients' }
      },
      {
        id: 'hotels',
        value: { vi: '5+', en: '5+' },
        label: { vi: 'Khách sạn 4–5 sao quốc tế', en: 'International 4–5 star hotels' }
      },
      { id: 'events', value: { vi: '200+', en: '200+' }, label: { vi: 'Sự kiện đã thực hiện', en: 'Events delivered' } }
    ],
    logos: {
      ariaLabel: { vi: 'Khách hàng và đối tác tiêu biểu', en: 'Featured clients and partners' },
      groups: [
        {
          id: 'hospitality',
          label: { vi: 'Khách sạn', en: 'Hospitality' },
          items: [
            {
              id: 'indigo',
              name: { vi: 'Indigo Saigon Hotel', en: 'Indigo Saigon Hotel' },
              image: '/images/b2b/logos/hospitality/indigo.png'
            },
            {
              id: 'fusion',
              name: { vi: 'Fusion Saigon Hotel', en: 'Fusion Saigon Hotel' },
              image: '/images/b2b/logos/hospitality/fusion.png'
            },
            {
              id: 'eastin',
              name: { vi: 'Eastin Saigon Hotel', en: 'Eastin Saigon Hotel' },
              image: '/images/b2b/logos/hospitality/eastin.png'
            }
          ]
        },
        {
          id: 'finance',
          label: { vi: 'Tài chính - Ngân hàng', en: 'Finance & Banking' },
          items: [
            {
              id: 'shinhan',
              name: { vi: 'Shinhan Bank', en: 'Shinhan Bank' },
              image: '/images/b2b/logos/finance/shinhan.png'
            },
            { id: 'mbbank', name: { vi: 'MB Bank', en: 'MB Bank' }, image: '/images/b2b/logos/finance/mbbank.png' },
            { id: 'woori', name: { vi: 'Woori Bank', en: 'Woori Bank' }, image: '/images/b2b/logos/finance/woori.png' }
          ]
        },
        {
          id: 'enterprise',
          label: { vi: 'Doanh nghiệp - Bán lẻ - Xây dựng', en: 'Enterprise - Retail - Construction' },
          items: [
            {
              id: 'sevenEleven',
              name: { vi: 'Seven-Eleven', en: 'Seven-Eleven' },
              image: '/images/b2b/logos/enterprise/seven-eleven.png'
            },
            {
              id: 'datxanh',
              name: { vi: 'Đất Xanh', en: 'Đất Xanh' },
              image: '/images/b2b/logos/enterprise/datxanh.png'
            },
            { id: 'gsenc', name: { vi: 'GS E&C', en: 'GS E&C' }, image: '/images/b2b/logos/enterprise/gsenc.png' },
            {
              id: 'tancang',
              name: { vi: 'Tân Cảng Sài Gòn', en: 'Tân Cảng Sài Gòn' },
              image: '/images/b2b/logos/enterprise/tancang.png'
            },
            {
              id: 'gelex',
              name: { vi: 'Gelex Group', en: 'Gelex Group' },
              image: '/images/b2b/logos/enterprise/gelex.png'
            },
            {
              id: 'masan',
              name: { vi: 'Masan Consumer', en: 'Masan Consumer' },
              image: '/images/b2b/logos/enterprise/masan.png'
            }
          ]
        }
      ]
    }
  },
  services: {
    title: { vi: 'Dịch Vụ Dành Riêng Cho Doanh Nghiệp', en: 'Services Built For Business' },
    description: {
      vi: 'Dù bạn cần một bình hoa cho phòng họp hay một chương trình hoa trọn năm cho khách sạn, mọi dịch vụ đều được may đo theo thương hiệu và không gian của bạn.',
      en: 'Whether you need a single boardroom centerpiece or a year-long hospitality program, every service is tailored to your brand and venue.'
    },
    explore: { vi: 'Trao đổi dịch vụ này', en: 'Discuss this service' },
    viewPackages: { vi: 'Xem gói hoa lan lễ tân', en: 'See reception packages' }
  },
  caseStudies: {
    title: { vi: 'Minh Chứng Năng Lực', en: 'Proven With Premium Partners' },
    description: {
      vi: 'Một góc nhìn cụ thể về một trong những hợp tác hospitality dài hạn của chúng tôi.',
      en: 'A closer look at one of our long-running hospitality engagements.'
    },
    items: [
      {
        id: 'indigo',
        logo: '/images/b2b/logos/hospitality/indigo.png',
        logoAlt: { vi: 'Indigo Saigon Hotel', en: 'Indigo Saigon Hotel' },
        badge: { vi: 'Khách sạn 5 sao quốc tế - IHG Group', en: '5-star international hotel - IHG Group' },
        summary: {
          vi: 'Hơn 1 năm qua, Hoa Theo Mùa đảm nhận toàn diện công tác hoa tươi tại Indigo Saigon Hotel - từ sảnh, khu vực phòng họp/sự kiện đến không gian F&B - với tần suất thay hoa hàng tuần. Thay vì duy trì một bộ phận hoa nội bộ, khách sạn giao toàn bộ quy trình này cho một đầu mối duy nhất: từ lên thiết kế theo mùa, đặt hoa, đến chăm sóc và thay mới - đảm bảo mọi không gian khách lưu trú đi qua luôn đúng tiêu chuẩn thẩm mỹ và đúng tinh thần thương hiệu khách sạn.',
          en: 'For over a year, Hoa Theo Mùa has run the full floral programme at Indigo Saigon Hotel - across the lobby, meeting and event spaces, and F&B - with weekly rotations. Instead of keeping an in-house florist team, the hotel hands the whole flow to a single partner: seasonal design, sourcing, daily care and replacement - so every space a guest walks through stays on brand and on standard.'
        },
        quote: {
          vi: 'Đội ngũ Hoa Theo Mùa truyền tải đúng ý tưởng vào thực tế ở nhiều không gian khác nhau trong khách sạn, được cả khách hàng và ban lãnh đạo đánh giá cao.',
          en: 'The Hoa Theo Mùa team brings ideas to life across every space in the hotel - guests and our leadership both notice.'
        },
        quoteAuthor: { vi: 'Chị Nicole Đoàn', en: 'Nicole Đoàn' },
        quoteRole: {
          vi: 'Marketing Manager, Indigo Saigon Hotel',
          en: 'Marketing Manager, Indigo Saigon Hotel'
        },
        photos: []
      }
    ],
    partners: {
      title: { vi: 'Đối tác doanh nghiệp tiêu biểu', en: 'Trusted enterprise partners' },
      description: {
        vi: 'Những thương hiệu đã đồng hành cùng Hoa Theo Mùa trong hành trình xây dựng trải nghiệm hoa chuẩn quốc tế.',
        en: 'Brands that have grown alongside Hoa Theo Mùa on the journey of building world-class floral experiences.'
      },
      items: [
        {
          id: 'fusion',
          logo: '/images/b2b/logos/hospitality/fusion.png',
          name: { vi: 'Fusion', en: 'Fusion' },
          role: { vi: 'Chuỗi khách sạn & resort', en: 'Hotel & resort group' },
          summary: {
            vi: 'Fusion lựa chọn Hoa Theo Mùa là đối tác triển khai dịch vụ hoa tươi định kỳ tại sảnh, nhà hàng và quầy thanh toán, với concept thay đổi theo mùa và phù hợp từng không gian - góp phần tạo điểm nhấn thẩm mỹ và trải nghiệm tinh tế cho khách lưu trú.',
            en: 'Fusion chose Hoa Theo Mùa as their partner for recurring floral services across the lobby, F&B and payment areas - with concepts that rotate by season and fit each space, adding aesthetic accents and refined touchpoints for every guest.'
          },
          logoAlt: { vi: 'Logo Fusion Hotel Group', en: 'Fusion Hotel Group logo' }
        },
        {
          id: 'masan',
          logo: '/images/b2b/logos/enterprise/masan.png',
          name: { vi: 'Masan Group', en: 'Masan Group' },
          role: { vi: 'Tập đoàn tiêu dùng', en: 'Consumer enterprise' },
          summary: {
            vi: 'Masan tin tưởng Hoa Theo Mùa triển khai dịch vụ hoa tươi định kỳ tại sảnh và khu lễ tân, giúp xây dựng không gian làm việc chuyên nghiệp và tạo ấn tượng tích cực với khách hàng, đối tác ngay từ điểm chạm đầu tiên.',
            en: 'Masan trusts Hoa Theo Mùa to deliver recurring fresh flowers at the lobby and reception - building a professional workspace and shaping a positive first impression for clients and partners from the very first touchpoint.'
          },
          logoAlt: { vi: 'Logo Masan Group', en: 'Masan Group logo' }
        },
        {
          id: 'tanCang',
          logo: '/images/b2b/logos/enterprise/tancang.png',
          name: { vi: 'Tân Cảng Sài Gòn', en: 'Tân Cảng Sài Gòn' },
          role: { vi: 'Hoa doanh nghiệp toàn quốc', en: 'Nationwide corporate gifting' },
          summary: {
            vi: 'Tân Cảng hợp tác cùng Hoa Theo Mùa để triển khai dịch vụ hoa doanh nghiệp và hoa chúc mừng sinh nhật đối tác trên toàn quốc - từ thiết kế mẫu, kiểm soát chất lượng đến giao hoa đúng thời gian, đúng địa điểm.',
            en: 'Tân Cảng partners with Hoa Theo Mùa to roll out corporate flowers and partner-birthday floral gifts nationwide - from bespoke design and quality control to on-time, on-address delivery across the country.'
          },
          logoAlt: { vi: 'Logo Tân Cảng Sài Gòn', en: 'Tân Cảng Sài Gòn logo' }
        },
        {
          id: 'eastin',
          logo: '/images/b2b/logos/hospitality/eastin.png',
          name: { vi: 'Eastin', en: 'Eastin' },
          role: { vi: 'Khách sạn 4 sao quốc tế', en: '4-star international hotel' },
          summary: {
            vi: 'Eastin lựa chọn Hoa Theo Mùa cho hoa hội nghị, hoa sự kiện, tiệc cưới, cùng dịch vụ cắt tỉa cây xanh và thay hoa định kỳ tại khu vực nhà hàng - luôn duy trì không gian chỉn chu và giàu sức sống.',
            en: 'Eastin chose Hoa Theo Mùa for conference and event flowers, wedding banquets, plus greenery trimming and recurring flower replacement in the F&B area - keeping the hotel space polished and full of life.'
          },
          logoAlt: { vi: 'Logo Eastin Hotel', en: 'Eastin Hotel logo' }
        }
      ]
    }
  },
  packages: {
    title: { vi: 'Gói Hoa Lan Lễ Tân', en: 'Reception Orchid Packages' },
    description: {
      vi: 'Ba lựa chọn cho không gian lễ tân – văn phòng: tối ưu, thuận tiện, sang trọng. Mọi gói đều bao gồm chăm sóc và thay hoa trọn gói.',
      en: 'Three options for reception and office spaces - efficient, convenient, premium. Every package includes full care and replacement.'
    },
    popular: { vi: 'Được chọn nhiều nhất', en: 'Most chosen' },
    fromLabel: { vi: 'Từ', en: 'From' },
    cta: { vi: 'Chọn gói này', en: 'Choose this package' },
    quarterlySuffix: { vi: '/quý', en: '/quarter' },
    items: [
      {
        id: 'nhuY',
        icon: 'flower',
        highlighted: false,
        name: { vi: 'Như Ý', en: 'Như Ý' },
        target: { vi: 'Lễ tân nhỏ, văn phòng khởi đầu', en: 'Small reception desks and starter offices' },
        price: { vi: '2.595.000đ', en: '2,595,000đ' },
        features: [
          { vi: '4 chậu hoa lan tươi', en: '4 fresh orchid pots' },
          { vi: 'Dưới 20m², bàn 1,2–1,6m', en: 'Under 20m², desk 1.2–1.6m' },
          { vi: '30W x 50H', en: '30W x 50H' },
          { vi: '1 địa điểm', en: '1 location' },
          { vi: 'Trọn gói 3 tháng - chăm sóc & thay hoa', en: 'Full 3-month care & replacement' }
        ]
      },
      {
        id: 'locPhat',
        icon: 'crown',
        highlighted: true,
        name: { vi: 'Lộc Phát', en: 'Lộc Phát' },
        target: {
          vi: 'Văn phòng vừa, cần điểm nhấn sang trọng',
          en: 'Mid-size offices that want a striking signature touch'
        },
        price: { vi: '3.995.000đ', en: '3,995,000đ' },
        features: [
          { vi: '4 chậu hoa lan tươi', en: '4 fresh orchid pots' },
          { vi: '25–40m², bàn 1,8–2,4m', en: '25–40m², desk 1.8–2.4m' },
          { vi: '45W x 60H', en: '45W x 60H' },
          { vi: '1 địa điểm', en: '1 location' },
          { vi: 'Trọn gói 3 tháng - chăm sóc & thay hoa', en: 'Full 3-month care & replacement' }
        ]
      },
      {
        id: 'thinhVuong',
        icon: 'diamond',
        highlighted: false,
        name: { vi: 'Thịnh Vượng', en: 'Thịnh Vượng' },
        target: {
          vi: 'Lễ tân lớn, quầy tiếp tân ấn tượng',
          en: 'Larger receptions and statement-making concierge counters'
        },
        price: { vi: '6.995.000đ', en: '6,995,000đ' },
        features: [
          { vi: '4 chậu hoa lan tươi', en: '4 fresh orchid pots' },
          { vi: '45–60m², quầy 2,6–3,6m', en: '45–60m², counter 2.6–3.6m' },
          { vi: '60W x 80H', en: '60W x 80H' },
          { vi: '1 địa điểm', en: '1 location' },
          { vi: 'Trọn gói 3 tháng - chăm sóc & thay hoa', en: 'Full 3-month care & replacement' }
        ]
      }
    ]
  },
  advantages: {
    eyebrow: { vi: 'Hoa Theo Mùa Cho Doanh Nghiệp', en: 'Hoa Theo Mùa for Business' },
    title: { vi: 'Vì Sao Đối Tác Chọn Hoa Theo Mùa', en: 'Why Partners Choose Hoa Theo Mùa' },
    description: {
      vi: 'Sự tinh tế của một boutique florist kết hợp với độ tin cậy vận hành mà doanh nghiệp cần.',
      en: 'The craft of a boutique florist paired with the operational reliability your business needs.'
    },
    items: [
      {
        id: 'onTime',
        icon: 'calendar',
        title: { vi: 'Đúng Giờ, Đúng Chất Lượng', en: 'On Time, On Quality' },
        description: {
          vi: 'Một lần hay hàng trăm lần, hoa luôn đến đúng giờ với độ tươi mới và cứng cáp - để sự kiện của bạn luôn hoàn hảo.',
          en: 'One delivery or a hundred, flowers arrive on schedule and at full freshness - so every event stays flawless.'
        }
      },
      {
        id: 'singlePoc',
        icon: 'handHeart',
        title: { vi: 'Một Đầu Mối Duy Nhất', en: 'One Single Point Of Contact' },
        description: {
          vi: 'Một florist riêng đồng hành xuyên suốt, nắm rõ thương hiệu, lịch trình và những yêu cầu riêng của doanh nghiệp bạn.',
          en: 'A dedicated florist stays with you end-to-end - knows your brand, your calendar, and your specific requirements.'
        }
      },
      {
        id: 'brandAligned',
        icon: 'palette',
        title: { vi: 'Thiết Kế Đồng Điệu Với Hình Ảnh Thương Hiệu', en: 'Designs Aligned With Your Brand' },
        description: {
          vi: 'Mỗi thiết kế hoa được sáng tạo để phản chiếu đúng tinh thần thương hiệu bạn muốn truyền tải.',
          en: 'Every arrangement is created to reflect the exact spirit your brand wants to express.'
        }
      },
      {
        id: 'transparent',
        icon: 'notebookPen',
        title: { vi: 'Vận Hành Minh Bạch, An Tâm Hợp Tác', en: 'Transparent Operations, Lasting Trust' },
        description: {
          vi: 'Hợp đồng, hóa đơn và quy trình thanh toán rõ ràng minh bạch giúp doanh nghiệp bạn an tâm hợp tác dài lâu.',
          en: 'Clear contracts, clean invoicing and a transparent payment flow - built for long-term partnerships.'
        }
      }
    ]
  },
  process: {
    eyebrow: { vi: 'Cách Chúng Tôi Làm Việc', en: 'How We Work' },
    title: { vi: 'Quy Trình Hợp Tác', en: 'Our Partnership Process' },
    description: {
      vi: 'Bốn bước đơn giản đảm bảo 3 đúng: đúng tinh thần thương hiệu - đúng tiến độ - đúng ngân sách.',
      en: 'Four simple steps that guarantee the three rights: right brand spirit - right schedule - right budget.'
    },
    steps: [
      {
        id: 'listen',
        icon: 'notebookPen',
        label: { vi: 'BƯỚC 01', en: 'STEP 01' },
        title: { vi: 'Lắng Nghe Nhu Cầu', en: 'Listen To Your Needs' },
        description: {
          vi: 'Chúng tôi gặp bạn để hiểu venue, đối tượng khách mời và cảm xúc bạn muốn để lại.',
          en: 'We meet you to understand the venue, audience and feeling you want guests to leave with.'
        }
      },
      {
        id: 'propose',
        icon: 'palette',
        label: { vi: 'BƯỚC 02', en: 'STEP 02' },
        title: { vi: 'Đề Xuất Ý Tưởng', en: 'Propose Ideas' },
        description: {
          vi: 'Mood board, bảng hoa và báo giá minh bạch - thường trong vòng 48 giờ.',
          en: 'Mood boards, a flower palette and a transparent quote - usually within 48 hours.'
        }
      },
      {
        id: 'sample',
        icon: 'sparkles',
        label: { vi: 'BƯỚC 03', en: 'STEP 03' },
        title: { vi: 'Làm Sản Phẩm Mẫu', en: 'Build A Sample' },
        description: {
          vi: 'Chúng tôi làm mẫu để bạn thấy, cảm nhận và xác nhận trước khi sản xuất chính thức.',
          en: 'We produce a sample piece so you can see, feel and confirm before full production.'
        }
      },
      {
        id: 'produce',
        icon: 'truck',
        label: { vi: 'BƯỚC 04', en: 'STEP 04' },
        title: { vi: 'Tiến Hành Sản Xuất', en: 'Run Production' },
        description: {
          vi: 'Chúng tôi đặt hoa, dưỡng, làm và giao tại chỗ - dựng và kiểm tra lần cuối trước giờ G.',
          en: 'We source, condition and arrange every piece - then deliver, install and walk through on the day.'
        }
      }
    ]
  },
  faq: {
    title: { vi: 'Câu Hỏi Thường Gặp', en: 'Frequently Asked Questions' },
    description: {
      vi: 'Trả lời nhanh những câu khách doanh nghiệp thường hỏi trước khi liên hệ.',
      en: 'Quick answers to what corporate buyers usually ask before getting in touch.'
    },
    items: [
      {
        id: 'pricing',
        question: {
          vi: 'Chi phí dịch vụ hoa doanh nghiệp được tính như thế nào?',
          en: 'How is B2B floral service pricing calculated?'
        },
        answer: {
          vi: 'Chi phí phụ thuộc vào 3 yếu tố: tần suất giao (hàng ngày/hàng tuần), loại hoa bạn chọn, và số lượng địa điểm. HTM có các gói từ cơ bản đến cao cấp, phù hợp với ngân sách của văn phòng, khách sạn hay ngân hàng. Nhắn cho HTM nhu cầu cụ thể qua <zalo>Zalo</zalo>, đội ngũ tư vấn báo giá trong 30 phút.',
          en: 'Pricing depends on three factors: delivery frequency (daily/weekly), the flower selection, and the number of locations. HTM offers packages from essentials to premium - matched to office, hotel or bank budgets. Send your specific requirements via <zalo>Zalo</zalo> and our team will quote within 30 minutes.'
        },
        hasZalo: true
      },
      {
        id: 'quality',
        question: {
          vi: 'Nếu hoa giao không đạt chất lượng, HTM xử lý ra sao?',
          en: "How does HTM handle deliveries that don't meet quality standards?"
        },
        answer: {
          vi: 'Hoa không tươi, không đúng mẫu hoặc giao trễ - HTM đổi mới miễn phí trong ngày. Đây là cam kết trong mọi hợp đồng doanh nghiệp, sự hài lòng của đối tác là mục tiêu phục vụ của chúng tôi.',
          en: 'Flowers that arrive wilted, off-brief or delivered late are replaced free of charge the same day. This is built into every corporate contract - partner satisfaction is our benchmark.'
        },
        hasZalo: false
      },
      {
        id: 'moq',
        question: {
          vi: 'Đơn hàng tối thiểu (MOQ) cho hợp đồng doanh nghiệp là bao nhiêu?',
          en: "What's the minimum order quantity (MOQ) for corporate contracts?"
        },
        answer: {
          vi: 'MOQ phụ thuộc vào loại hình dịch vụ mà doanh nghiệp chọn. Nhắn cho HTM nhu cầu cụ thể qua <zalo>Zalo</zalo>, đội ngũ tư vấn sẽ hỗ trợ trong 30 phút.',
          en: 'MOQ depends on the service tier your business selects. Send your specific requirements via <zalo>Zalo</zalo> and our team will support you within 30 minutes.'
        },
        hasZalo: true
      },
      {
        id: 'contractTerm',
        question: { vi: 'Thời gian hợp đồng tối thiểu là bao lâu?', en: "What's the minimum contract length?" },
        answer: {
          vi: '3 tháng là thời gian phù hợp để doanh nghiệp trải nghiệm chất lượng trước khi cam kết dài hơn - không ràng buộc nếu chưa thấy phù hợp.',
          en: "3 months lets your business experience the quality before committing longer - no lock-in if it doesn't feel right."
        },
        hasZalo: false
      },
      {
        id: 'customization',
        question: {
          vi: 'HTM có thể tùy chỉnh hoa theo màu sắc/thương hiệu công ty không?',
          en: 'Can HTM customise flowers to match our brand colours or identity?'
        },
        answer: {
          vi: 'Có. HTM phối hoa theo màu nhận diện thương hiệu, theo mùa lễ tân hoặc theo concept sự kiện của bạn. Gửi logo hoặc bảng màu, đội thiết kế sẽ lên mẫu trước khi ký hợp đồng.',
          en: 'Yes. We arrange flowers around your brand palette, seasonal reception theme or event concept. Share your logo or colour swatches and our design team will mock up samples before contract signing.'
        },
        hasZalo: false
      },
      {
        id: 'coverage',
        question: {
          vi: 'Khu vực giao hàng hiện tại gồm những thành phố nào?',
          en: 'Which cities do you currently deliver to?'
        },
        answer: {
          vi: 'Hiện tại HTM chỉ phục vụ tại Thành phố Hồ Chí Minh. Với các khu vực ngoài TP.HCM, nhắn <zalo>Zalo</zalo> để HTM kiểm tra khả năng giao theo yêu cầu riêng.',
          en: "We currently serve Ho Chi Minh City only. For areas outside HCMC, message us on <zalo>Zalo</zalo> and we'll check bespoke delivery options."
        },
        hasZalo: true
      },
      {
        id: 'flexibility',
        question: {
          vi: 'Có thể đổi hoặc tạm dừng lịch giao hoa định kỳ khi cần không?',
          en: 'Can we reschedule or pause a recurring delivery?'
        },
        answer: {
          vi: 'Được. Bạn chỉ cần báo trước 72h qua Zalo hoặc email, HTM điều chỉnh lịch mà không phát sinh phí.',
          en: "Yes. Just give us 72 hours' notice via Zalo or email, and HTM will adjust the schedule at no extra cost."
        },
        hasZalo: false
      }
    ]
  },
  cta: {
    eyebrow: { vi: 'B2B', en: 'B2B' },
    subEyebrow: { vi: 'Hoa Theo Mùa cho Doanh nghiệp', en: 'Hoa Theo Mùa for Business' },
    title: { vi: 'Cùng kiến tạo một điều gì đó nở rộ', en: "Let's create something blooming together" },
    description: {
      vi: 'Kể chúng tôi nghe về dự án của bạn - chúng tôi sẽ phản hồi trong vòng 4 giờ làm việc với ý tưởng đầu tiên và bước tiếp theo rõ ràng.',
      en: "Tell us about your project - we'll get back within 4 working hours with first ideas and a clear next step."
    },
    callLabel: { vi: 'Hotline', en: 'Hotline' },
    emailLabel: { vi: 'Hợp tác', en: 'Partnerships' },
    primary: { vi: 'Gửi brief', en: 'Send a brief' },
    secondary: { vi: 'Xem sản phẩm của chúng tôi', en: 'Browse our products' }
  }
}
