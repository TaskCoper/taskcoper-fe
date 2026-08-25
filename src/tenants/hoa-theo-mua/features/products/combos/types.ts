export const ComboRole = {
  1: '1',
  2: '2'
} as const

export type ComboRole = (typeof ComboRole)[keyof typeof ComboRole]

export const ComboRoleLabel = {
  [ComboRole[1]]: 'products.detail.comboSpecification.core',
  [ComboRole[2]]: 'products.detail.comboSpecification.support'
} satisfies Record<ComboRole, string>

export interface ComboMaterial {
  materialId: string
  subId?: string | null
  materialName?: string | null
  coverImage?: string | null
  role?: ComboRole | null
  roleName?: string | null
  isCore: boolean
  quantityPerCombo: number
  unit: string | null
  availableForSale: number | null
  maxComboPossible: number | null
}

export interface ComboSpecification {
  subId: string
  productCode: string
  productName: string
  isActive?: boolean | null
  factor?: number | null
  materials: ComboMaterial[]
}

export type MaterialProductLabel = 'Thành phần' | 'Phụ liệu'

export interface MaterialOption {
  materialId: string
  materialCode: string
  materialName: string
  coverImage?: string | null
  unit: string | null
  availableForSale: number | null
}

export interface UpdateComboSpecificationMaterial {
  matId: string
  quantity: number
  isCore: boolean
  isActive: boolean
}

export interface UpdateComboSpecificationPayload {
  subId: string
  factor: number | null
  materials: UpdateComboSpecificationMaterial[]
}

export interface DeleteComboSpecificationItemsPayload {
  materials: string[]
}
export interface UpdateComboSpecificationItem {
  matId: string
  quantity: number
  isCore: boolean
  isActive: boolean
}

export interface UpdateComboSpecificationItemsPayload {
  items: UpdateComboSpecificationItem[]
}

export type AddComboSpecificationItem = UpdateComboSpecificationItem

export interface AddComboSpecificationItemsPayload {
  items: AddComboSpecificationItem[]
}
