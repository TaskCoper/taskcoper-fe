export interface AhamoveServiceDetail {
  _id: string
  enable: boolean
  order: number
  city_id: string

  name: string
  name_vi_vn: string
  name_en_us: string

  icon_url: string
  map_icon_url: string

  distance_fee: string
  partner_distance_fee: string

  commission_type: AhamoveCommissionType
  commission_value: number
  pool_timeout_commission_value: number

  max_distance: number
  stop_fee: number
  rebroadcast_interval: number
  broadcast_distance: number

  require_to: boolean
  auto_assign: boolean
  auto_assign_distance: number
  require_request: boolean
  advance_broadcast_distance: number

  timeout: number
  idle_timeout: number

  cod: number
  max_cod_per_stop_point: number
  first_order_cod: number
  max_stop_points: number
  max_concurrent_orders: number

  fee_description_en_us: string
  fee_description_vi_vn: string
  description_en_us: string
  description_vi_vn: string

  parent_id: string
  supplier_description: string
  notify_package_return: boolean

  uniform_verify_message_vi_vn: string
  uniform_verify_message_en_us: string
  note: string
  request_list: string

  cross_service: AhamoveCrossService
  delivery_type: AhamoveDeliveryType

  pool_min_score: number
  redirect_url: string
  redirect_service_id: string
  require_redirect: boolean
  set_idle_status_when_creating_order: boolean

  distance_fee_v3: AhamoveDistanceFeeV3
  partner_distance_fee_v3: AhamoveDistanceFeeV3 | null

  cod_commission: AhamoveCodCommission | null

  pending_period: number
  need_confirm_before_pickup: boolean
  delay_time: number
  limit_call: boolean

  RouteAPIUrl: string

  is_saas: boolean

  group_name_en_us: string
  group_name_vi_vn: string
  group_id: string

  enable_platform: string[]

  StopFailed: number
  RebroadcastLimit: number

  cross_city: AhamoveCrossCity
  available_districts: string[]

  max_cod: number

  saas_distance_fee_v3: AhamoveDistanceFeeV3 | null
  saas_stop_fee: number

  vat_rate: number
  priority_score: number

  is_pay_cod_discrepancy: boolean
  premium_service_fee: number

  require_pof: boolean
  pof_type: string
  enable_upload_pof: boolean

  require_pop: boolean
  pop_type: string

  require_pod: boolean
  pod_type: string

  hour_fee: AhamoveHourFee | null

  boundary_restricted: AhamoveBoundaryRestricted | null

  requests: AhamoveServiceRequest[]

  vehicle_info: AhamoveVehicleInfo

  weight_fee: unknown | null
  partner_weight_fee: unknown | null

  map_icon_3d: AhamoveMapIcon3D

  is_tip_allowed: boolean
  is_select_vehicle_allowed: boolean

  surge_hours: AhamoveSurgeHours

  partner_stop_fee: number
  max_item_value: number

  user_cancellation_window_in_seconds: Partial<Record<AhamoveOrderStatus, number>>

  surge_rate_by_days_from_booking: unknown | null
}

export type AhamoveCommissionType = 'PERCENTAGE' | 'FLAT'

export type AhamoveDeliveryType = 'INSTANT' | string

export type AhamoveOrderStatus = 'IDLE' | 'ASSIGNING' | 'ACCEPTED' | 'IN_PROCESS' | 'COMPLETED' | 'CANCELLED' | 'FAILED'

export interface AhamoveCrossService {
  enable: boolean
  services: string[]
}

export interface AhamoveCrossCity {
  enable: boolean
  cities: string[]
}

export interface AhamoveDistanceFeeV3 {
  blocks: AhamoveDistanceFeeBlock[]
  hour_rates: AhamoveHourRate[]
}

export interface AhamoveDistanceFeeBlock {
  from: number
  to: number
  base: number
  price_multiplier: number
}

export interface AhamoveHourRate {
  from: number
  to: number
  rate: number
}

export interface AhamoveCodCommission {
  value: number
  none_commission_limit: number
  blocks: AhamoveCodCommissionBlock[] | null
}

export interface AhamoveCodCommissionBlock {
  from: number
  to: number
  type: AhamoveCommissionType
  value: number
  min_fee: number
}

export interface AhamoveBoundaryRestricted {
  type: 'Polygon' | string
  coordinates: number[][][][]
}

export interface AhamoveServiceRequest {
  _id: string

  description: string | null
  description_en_us: string | null
  description_vi_vn: string | null

  enable: boolean

  icon_url: string
  img_url: string

  name: string
  name_en_us: string
  name_vi_vn: string

  order: number

  original_price: number
  price: number

  service_id: string
  type: AhamoveServiceRequestType

  device_types: AhamoveDeviceType[] | null

  service_group_id: string

  transfer_cod: boolean
  no_promotion: boolean
  no_supplier_payout: boolean

  applied_stp_num: number | null
  none_cod_price_blocks: Record<string, number> | null

  subtype: string | null
  max_pod: number | null

  cod_commission: AhamoveCodCommission | null

  group_id: string

  tier_list: AhamoveTier[] | null

  support_remarks: boolean | null
  supplier_description_url: string | null

  no_commission: boolean | null
  reimbursement: boolean | null
  max_input: number | null

  send_sms: boolean | null
  sms_template_v3: string | null
  sms_demo: string | null

  price_blocks: AhamovePriceBlock[] | null

  description_url: string | null
  benefit_url: string | null

  options: AhamoveRequestOption[] | null

  max_distance: number | null

  require_pod: boolean | null
  pod_type: string | null

  require_por: boolean | null
  por_type: string | null

  delivery_option: boolean | null
}

export type AhamoveServiceRequestType =
  | 'BOOLEAN'
  | 'TIER'
  | 'COD_COMMISSION'
  | 'COD_INSURANCE'
  | 'INPUT'
  | 'COMMISSION_DISTANCE_PERCENTAGE'
  | 'PER_UNIT'
  | string

export type AhamoveDeviceType = 'web' | 'android' | 'ios' | string

export interface AhamoveTier {
  code: string
  name_vi_vn: string
  name_en_us: string
  selectable: boolean
  price: number
  price_description_vi_vn: string
  price_description_en_us: string
  description_vi_vn: string
  description_en_us: string
  img_url: string
}

export interface AhamoveRequestOption {
  code: string
  name_vi_vn: string
  name_en_us: string
  selectable: boolean
  price: number
  short_name_vi_vn: string
  short_name_en_us: string
  need_user_input: boolean | null
}

export interface AhamovePriceBlock {
  from: number
  to: number
  price: number
  type: string
  value: number
}

export interface AhamoveVehicleInfo {
  weight: number
  length: number
  width: number
  height: number
}

export interface AhamoveMapIcon3D {
  url: string
  sprite_size: number
  sprite_count: number
  original_icon_url: string
  ads_icon_url: string
  ads_icon_size: number
}

export type AhamoveSurgeHours = Partial<Record<AhamoveDayOfWeekIndex, AhamoveSurgeHour[]>>

export type AhamoveDayOfWeekIndex = '0' | '1' | '2' | '3' | '4' | '5' | '6'

export interface AhamoveSurgeHour {
  start_time: number
  end_time: number
  surge_type: AhamoveSurgeType
  surge_value: number
}

export type AhamoveSurgeType = 'FLAT' | 'PERCENTAGE' | string

export interface AhamoveHourFee {
  from: number
  to: number
  price: number
}
