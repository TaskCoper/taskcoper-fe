import type { DateRange } from 'react-day-picker'

export const configs = [
  {
    key: 'shippingLocation',
    value: {
      label: 'Địa chỉ lấy hàng mặc định',
      description: 'Địa chỉ mặc định dùng để tính phí vận chuyển và tạo đơn giao hàng.',
      group: 'shipping',
      inputType: 'address',
      value: {
        city: 'Hồ Chí Minh',
        ward: 'Phường Sài Gòn',
        street: '72 Lê Thánh Tôn'
      },
      validations: {
        required: true,
        minLength: 10,
        maxLength: 200
      },
      isEditable: true,
      order: 1
    }
  },
  {
    key: 'defaultDepot',
    value: {
      label: 'Kho mặc định',
      description: 'Kho được chọn mặc định khi tạo đơn hàng mới.',
      group: 'shipping',
      inputType: 'select',
      value: 1111,
      options: [
        { label: 'Kho chính', value: 1111 },
        { label: 'Kho phụ', value: 2222 },
        { label: 'Kho khác', value: 3333 }
      ],
      validations: {
        required: true
      },
      isEditable: true,
      order: 2
    }
  },
  {
    key: 'depositRate',
    value: {
      label: 'Tỷ lệ đặt cọc',
      description: 'Tỷ lệ tiền khách cần đặt cọc trước khi xác nhận đơn.',
      group: 'payment',
      inputType: 'percentage',
      value: 0.3,
      defaultValue: 0.3,
      unit: '%',
      validations: {
        required: true,
        min: 0,
        max: 1
      },
      isEditable: true,
      order: 3
    }
  },
  {
    key: 'minimumOrderAmount',
    value: {
      label: 'Giá trị đơn hàng tối thiểu',
      description: 'Đơn hàng phải đạt giá trị này mới được phép checkout.',
      group: 'order',
      inputType: 'currency',
      value: 100000,
      unit: 'VND',
      validations: {
        required: true,
        min: 0
      },
      isEditable: true,
      order: 4
    }
  },
  {
    key: 'freeShippingThreshold',
    value: {
      label: 'Ngưỡng miễn phí vận chuyển',
      description: 'Đơn hàng từ giá trị này trở lên sẽ được miễn phí giao hàng.',
      group: 'shipping',
      inputType: 'currency',
      value: 500000,
      unit: 'VND',
      validations: {
        required: true,
        min: 0
      },
      isEditable: true,
      order: 5
    }
  },
  {
    key: 'deliveryRadius',
    value: {
      label: 'Bán kính giao hàng tối đa',
      description: 'Khoảng cách giao hàng tối đa tính từ kho mặc định.',
      group: 'shipping',
      inputType: 'number',
      value: 15,
      unit: 'km',
      validations: {
        required: true,
        min: 1,
        max: 100
      },
      isEditable: true,
      order: 6
    }
  },
  {
    key: 'orderCancellationWindow',
    value: {
      label: 'Thời gian cho phép hủy đơn',
      description: 'Khách chỉ có thể hủy đơn trong khoảng thời gian này sau khi đặt hàng.',
      group: 'order',
      inputType: 'number',
      value: 30,
      unit: 'minutes',
      validations: {
        required: true,
        min: 0,
        max: 1440
      },
      isEditable: true,
      order: 7
    }
  },
  {
    key: 'customerRewardRate',
    value: {
      label: 'Tỷ lệ tích điểm',
      description: 'Tỷ lệ quy đổi từ giá trị đơn hàng sang điểm thưởng.',
      group: 'reward',
      inputType: 'percentage',
      value: 0.05,
      unit: '%',
      validations: {
        required: true,
        min: 0,
        max: 1
      },
      isEditable: true,
      order: 8
    }
  },
  {
    key: 'maxCODAmount',
    value: {
      label: 'Giới hạn COD tối đa',
      description: 'Giá trị đơn hàng tối đa được phép thanh toán COD.',
      group: 'payment',
      inputType: 'currency',
      value: 2000000,
      unit: 'VND',
      validations: {
        required: true,
        min: 0
      },
      isEditable: true,
      order: 9
    }
  },
  {
    key: 'supportPhoneNumber',
    value: {
      label: 'Số điện thoại hỗ trợ',
      description: 'Số điện thoại hiển thị cho khách hàng khi cần hỗ trợ.',
      group: 'general',
      inputType: 'text',
      value: '0900000000',
      placeholder: 'Nhập số điện thoại hỗ trợ',
      validations: {
        required: true,
        minLength: 8,
        maxLength: 15,
        pattern: '^[0-9+\\s-]+$'
      },
      isEditable: true,
      order: 10
    }
  },
  {
    key: 'allowedDeliveryServices',
    value: {
      label: 'Đơn vị vận chuyển',
      description: 'Đơn vị vận chuyển hỗ trợ cho khách hàng để giao hàng.',
      group: 'shipping',
      inputType: 'checkbox',
      items: ['ahamove', 'grab', 'be'],
      options: [
        { label: 'Ahamove', value: 'ahamove' },
        { label: 'Grab', value: 'grab' },
        { label: 'Be', value: 'be' }
      ]
    }
  },
  {
    key: 'featureSettings',
    value: {
      label: 'Cấu hình tính năng',
      description: 'Bật/tắt các tính năng chính của hệ thống.',
      group: 'feature',
      inputType: 'switch-group',
      items: [
        {
          key: 'enableCOD',
          label: 'Cho phép COD',
          description: 'Cho phép khách thanh toán khi nhận hàng.',
          value: true
        },
        {
          key: 'enableDeposit',
          label: 'Bắt buộc đặt cọc',
          description: 'Khách phải đặt cọc trước khi xác nhận đơn.',
          value: true
        },
        {
          key: 'enableVoucher',
          label: 'Cho phép sử dụng voucher',
          description: 'Cho phép áp dụng voucher khi thanh toán.',
          value: true
        },
        {
          key: 'enableRewardPoint',
          label: 'Bật tích điểm',
          description: 'Cho phép khách tích điểm sau khi mua hàng.',
          value: false
        },
        {
          key: 'enableAhamove',
          label: 'Bật giao hàng Ahamove',
          description: 'Cho phép sử dụng Ahamove làm đơn vị vận chuyển.',
          value: true
        },
        {
          key: 'showOutOfStockProduct',
          label: 'Hiển thị sản phẩm hết hàng',
          description: 'Hiển thị sản phẩm đã hết hàng trên website.',
          value: true
        },
        {
          key: 'maintenanceMode',
          label: 'Chế độ bảo trì',
          description: 'Tạm khóa website đối với khách hàng.',
          value: false
        },
        {
          key: 'autoConfirmOrder',
          label: 'Tự động xác nhận đơn',
          description: 'Đơn hàng sẽ tự động được xác nhận sau khi tạo.',
          value: false
        }
      ]
    }
  },
  {
    key: 'maintenanceDate',
    value: {
      label: 'Ngày bảo trì',
      description: 'Ngày hệ thống bắt đầu bảo trì.',
      group: 'dateSettings',
      inputType: 'date',
      value: '2026-06-20'
    }
  },
  {
    key: 'rewardPointExpiredAt',
    value: {
      label: 'Ngày hết hạn điểm thưởng',
      description: 'Ngày hết hạn điểm thưởng.',
      group: 'dateSettings',
      inputType: 'date',
      value: '2026-12-31'
    }
  },
  {
    key: 'summerSaleCampaign',
    value: {
      label: 'Thời gian khuyến mãi hè',
      description: 'Thời gian áp dụng khuyến mãi hè.',
      group: 'dateSettings',
      inputType: 'dateRange',
      value: {
        from: new Date('2026-06-01'),
        to: new Date('2026-07-10')
      } satisfies DateRange
    }
  }
]

// Địa chỉ lấy hàng mặc định - 13A Đào Duy Anh, Phường 9, Phú Nhuận, Hồ Chí Minh
// Thông tin dịch vụ ahamove
// [
//   {
//     "_id": "SGN-BIKE",
//     "requests": [
//       {
//         "_id": "SGN-BIKE-SMS"
//       },
//       {
//         "_id": "SGN-BIKE-D2D"
//       },
//       {
//         "_id": "SGN-BIKE-FRAGILE"
//       },
//       {
//         "_id": "SGN-BIKE-BULKY",
//         "tier_code": "TIER_2"
//       }
//     ]
//   }
// ]
