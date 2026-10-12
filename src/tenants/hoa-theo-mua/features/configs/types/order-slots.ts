export interface OrderTagOption {
  label: string
  value: number
}

export interface OrderTagsConfig {
  group: string
  label: string
  value: number[]
  slotLimits: Record<string, number | null>
  options: OrderTagOption[]
  required: boolean
  inputType: string
  validations: unknown[]
}

export interface DeliverySlotLimit {
  tagId: number
  limit: number
}

export interface UpdateDeliverySlotLimitsBody {
  slots: DeliverySlotLimit[]
}
