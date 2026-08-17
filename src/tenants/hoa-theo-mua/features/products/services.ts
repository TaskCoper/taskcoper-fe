import type { BasePaginationResponse, BaseResponse } from '@/lib/axios'
import { BaseService } from '../../services/base.service'
import type { GetProductsParams } from './hooks/use-get-products'
import type {
  ComboSpecification,
  DeleteComboSpecificationItemsPayload,
  MaterialsPage,
  MaterialOption,
  AddComboSpecificationItemsPayload,
  UpdateComboSpecificationItemsPayload,
  UpdateComboSpecificationPayload
} from './combos/types'
import type { PinnedProduct, ProductDetail } from './types'
import { productDetailToProduct } from './utils'

const getMockComboSpecification = (id: string | number): ComboSpecification => ({
  subId: String(id),
  productCode: 'MOCK_COMBO',
  productName: 'Công thức combo tạm thời',
  materials: [
    {
      materialId: 'mock-material-001',
      materialName: 'Hoa hồng Julibee',
      coverImage: null,
      role: 1,
      roleName: 'Core',
      quantityPerCombo: 10,
      unit: 'Cành',
      availableForSale: 50,
      maxComboPossible: 5
    },
    {
      materialId: 'mock-material-002',
      materialName: 'Hoa lá phụ Cẩm Chướng',
      coverImage: null,
      role: 1,
      roleName: 'Core',
      quantityPerCombo: 5,
      unit: 'Cành',
      availableForSale: 40,
      maxComboPossible: 8
    },
    {
      materialId: 'mock-material-003',
      materialName: 'Giấy gói hoa Hàn Quốc',
      coverImage: null,
      role: 2,
      roleName: 'Support',
      quantityPerCombo: 2,
      unit: 'Tờ',
      availableForSale: 30,
      maxComboPossible: 15
    },
    {
      materialId: 'mock-material-004',
      materialName: 'Hoa hồng đỏ Sa Đéc',
      coverImage: null,
      role: 1,
      roleName: 'Core',
      quantityPerCombo: 2,
      unit: 'Cành',
      availableForSale: 7,
      maxComboPossible: 3
    },
    {
      materialId: 'mock-material-005',
      materialName: 'Hoa hồng trắng',
      coverImage: null,
      role: 1,
      roleName: 'Core',
      quantityPerCombo: 3,
      unit: 'Cành',
      availableForSale: 30,
      maxComboPossible: 10
    },
    {
      materialId: 'mock-material-006',
      materialName: 'Hoa Baby Hà Lan (Hết hàng)',
      coverImage: null,
      role: 2,
      roleName: 'Support',
      quantityPerCombo: 1,
      unit: 'Bó',
      availableForSale: 0,
      maxComboPossible: 0
    },
    {
      materialId: 'mock-material-007',
      materialName: 'Giấy gói kiếng trong suốt',
      coverImage: null,
      role: 2,
      roleName: 'Support',
      quantityPerCombo: 1,
      unit: 'Tờ',
      availableForSale: 100,
      maxComboPossible: 100
    },
    {
      materialId: 'mock-material-008',
      materialName: 'Dây ruy băng Satin đỏ',
      coverImage: null,
      role: 2,
      roleName: 'Support',
      quantityPerCombo: 1,
      unit: 'Cuộn',
      availableForSale: 20,
      maxComboPossible: 20
    }
  ]
})

const mockMaterials: MaterialOption[] = [
  {
    materialId: 'mock-material-014',
    materialCode: 'HOA_HONG_DO_MOCK',
    materialName: 'Hoa hồng đỏ mock',
    coverImage: null,
    unit: 'Cành',
    availableForSale: 150
  },
  {
    materialId: 'mock-material-015',
    materialCode: 'HOA_BABY_TRANG_MOCK',
    materialName: 'Hoa baby trắng mock',
    coverImage: null,
    unit: 'Bó',
    availableForSale: 45
  },
  {
    materialId: 'mock-material-016',
    materialCode: 'GIAY_GOI_HAN_MOCK',
    materialName: 'Giấy gói hoa Hàn Quốc mock',
    coverImage: null,
    unit: 'Tờ',
    availableForSale: 80
  },
  {
    materialId: 'mock-material-017',
    materialCode: 'DAY_RUY_BANG_MOCK',
    materialName: 'Dây ruy băng satin mock',
    coverImage: null,
    unit: 'Cuộn',
    availableForSale: 32
  },
  {
    materialId: 'mock-material-018',
    materialCode: 'HOA_HUONG_DUONG_MOCK',
    materialName: 'Hoa hướng dương mock',
    unit: 'Cành',
    availableForSale: 12 // Tồn kho ít (dùng test LOW_STOCK)
  },
  {
    materialId: 'mock-material-009',
    materialCode: 'HOA_HONG_TRANG_MOCK',
    materialName: 'Hoa hồng trắng mock',
    unit: 'Cành',
    availableForSale: 30
  },
  {
    materialId: 'mock-material-010',
    materialCode: 'HOA_TULIP_VANG_MOCK',
    materialName: 'Hoa tulip vàng mock',
    unit: 'Cành',
    availableForSale: 0 // Hết hàng (dùng test OUT_OF_STOCK)
  },
  {
    materialId: 'mock-material-011',
    materialCode: 'LA_CALI_MOCK',
    materialName: 'Lá bạch đàn (Cali) mock',
    unit: 'Cành',
    availableForSale: 100
  },
  {
    materialId: 'mock-material-012',
    materialCode: 'XOP_CAM_HOA_MOCK',
    materialName: 'Xốp cắm hoa Oasis mock',
    unit: 'Cục',
    availableForSale: 25
  },
  {
    materialId: 'mock-material-013',
    materialCode: 'TUI_XACH_HOA_MOCK',
    materialName: 'Túi xách trong suốt đựng hoa mock',
    unit: 'Cái',
    availableForSale: 5
  },
  {
    materialId: 'mock-material-019',
    materialCode: 'HOA_HONG_TRANG_MOCK',
    materialName: 'Hoa hồng trắng mock',
    unit: 'Cành',
    availableForSale: 30
  },
  {
    materialId: 'mock-material-020',
    materialCode: 'HOA_TULIP_VANG_MOCK',
    materialName: 'Hoa tulip vàng mock',
    unit: 'Cành',
    availableForSale: 0 // Hết hàng (dùng test OUT_OF_STOCK)
  },
  {
    materialId: 'mock-material-021',
    materialCode: 'LA_CALI_MOCK',
    materialName: 'Lá bạch đàn (Cali) mock',
    unit: 'Cành',
    availableForSale: 100
  },
  {
    materialId: 'mock-material-022',
    materialCode: 'XOP_CAM_HOA_MOCK',
    materialName: 'Xốp cắm hoa Oasis mock',
    unit: 'Cục',
    availableForSale: 25
  },
  {
    materialId: 'mock-material-023',
    materialCode: 'TUI_XACH_HOA_MOCK',
    materialName: 'Túi xách trong suốt đựng hoa mock',
    unit: 'Cái',
    availableForSale: 5
  }
]

class ProductService extends BaseService {
  private readonly baseUrl = 'products'
  private readonly baseComboUrl = 'combo-specification'

  // getProducts = async ({ pageIndex, pageSize, search, categoryIds, priceFrom, priceTo, sortBy }: GetProductsParams) => {
  //   const { data } = await this.get<BasePaginationResponse<ProductDetail>>(`/v1/${this.baseUrl}`, {
  //     params: {
  //       pageIndex,
  //       pageSize,
  //       search,
  //       categoryIds,
  //       priceFrom,
  //       priceTo,
  //       sortBy
  //     }
  //   })

  //   return {
  //     ...data,
  //     value: {
  //       ...data.value,
  //       items: data.value.items.map(productDetailToProduct)
  //     }
  //   }
  // }

  getProducts = async ({
    pageIndex,
    pageSize,
    search,
    categoryIds,
    priceFrom,
    priceTo,
    sortBy,
    isPin,
    tag
  }: GetProductsParams) => {
    const { data } = await this.get<BasePaginationResponse<ProductDetail>>(`/v2/${this.baseUrl}`, {
      params: {
        pageIndex,
        pageSize,
        search,
        categoryIds,
        priceFrom,
        priceTo,
        sortBy,
        isPin,
        tag
      }
    })

    return {
      ...data,
      value: {
        ...data.value,
        items: data.value.items.map(productDetailToProduct)
      }
    }
  }

  getPinnedProducts = async ({ categoryId }: { categoryId?: string }) => {
    const { data } = await this.get<BaseResponse<PinnedProduct[]>>(`/v1/${this.baseUrl}-pin`, {
      params: {
        CategoryId: categoryId
      }
    })

    return data.value
  }

  getProduct = async ({ id }: { id: string | number }) => {
    const { data } = await this.get<BaseResponse<ProductDetail>>(`/v1/${this.baseUrl}/${id}`)

    return data.value
  }

  getComboSpecification = async ({ id }: { id: string | number }) => {
    try {
      const { data } = await this.get<BaseResponse<ComboSpecification>>(`/v1/${this.baseComboUrl}/${id}`)
      return data.value
    } catch {
      // Temporary fallback so the quantity UI remains usable while the API is being connected.
      return getMockComboSpecification(id)
    }
  }

  getMaterials = async ({ search, page = 1, pageSize = 20 }: { search?: string; page?: number; pageSize?: number }) => {
    try {
      const { data } = await this.get<BaseResponse<MaterialsPage>>(`/v1/materials`, {
        params: { search, page, pageSize }
      })

      return data.value
    } catch {
      const normalizedSearch = search?.trim().toLowerCase()
      const filteredItems = normalizedSearch
        ? mockMaterials.filter(
            (material) =>
              material.materialName.toLowerCase().includes(normalizedSearch) ||
              material.materialCode.toLowerCase().includes(normalizedSearch)
          )
        : mockMaterials

      const normalizedPage = Math.max(1, page)
      const normalizedPageSize = Math.max(1, pageSize)
      const startIndex = (normalizedPage - 1) * normalizedPageSize

      return {
        page: normalizedPage,
        pageSize: normalizedPageSize,
        totalItems: filteredItems.length,
        totalPages: Math.ceil(filteredItems.length / normalizedPageSize),
        items: filteredItems.slice(startIndex, startIndex + normalizedPageSize)
      }
    }
  }

  updateChildQuantity = async ({ productId, factor }: { productId: string | number; factor: number }) => {
    const { data } = await this.put<BaseResponse<string>>(`/v1/${this.baseComboUrl}/child-quantity`, {
      productId,
      factor
    })

    return data.value
  }

  addComboSpecificationItems = async ({
    comboId,
    body
  }: {
    comboId: string | number
    body: AddComboSpecificationItemsPayload
  }) => {
    const { data } = await this.post<BaseResponse<string>>(`/v1/${this.baseComboUrl}/${comboId}`, body)

    return data.value
  }

  //Update factor and rule
  updateComboSpecification = async ({ id, body }: { id: string | number; body: UpdateComboSpecificationPayload }) => {
    const { data } = await this.post<BaseResponse<string>>(`/v1/${this.baseUrl}/${id}/combo-specification`, body)

    return data.value
  }

  deleteComboSpecificationItems = async ({
    id,
    body
  }: {
    id: string | number
    body: DeleteComboSpecificationItemsPayload
  }) => {
    const { data } = await this.delete<BaseResponse<string>>(`/v1/${this.baseComboUrl}/${id}`, { data: body })

    return data.value
  }

  updateComboSpecificationItems = async ({
    comboId,
    body
  }: {
    comboId: string | number
    body: UpdateComboSpecificationItemsPayload
  }) => {
    const { data } = await this.put<BaseResponse<string>>(`/v1/${this.baseComboUrl}/${comboId}`, body)

    return data.value
  }

  moveProduct = async ({ id, position, categoryId }: { id: string; position: number; categoryId?: string }) => {
    // `categoryId` selects which (isPin, position) pair the backend writes: absent → the Product-level
    // position, present → the junction (product ↔ category) position. `undefined` is dropped by JSON
    // serialization, so a global move sends a clean `{ position }` body.
    const { data } = await this.put<BaseResponse<string>>(`/v1/${this.baseUrl}/${id}/move`, {
      position,
      categoryId
    })

    return data.value
  }

  pinProduct = async ({ body }: { body: { productId: string; isPin: boolean; categoryId?: string } }) => {
    const { data } = await this.put<BaseResponse<string>>(`/v1/${this.baseUrl}/pin`, body)

    return data.value
  }

  getMaxPriceProduct = async ({ categoryId }: { categoryId?: string }) => {
    const { data } = await this.get<BaseResponse<number>>(`/v1/${this.baseUrl}/max-price`, {
      params: {
        categoryId
      }
    })

    return data.value
  }
}

const productService = new ProductService()
export default productService
