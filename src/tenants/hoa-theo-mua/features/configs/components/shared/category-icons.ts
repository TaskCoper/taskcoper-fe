import {
  Bike,
  Building2,
  Contact,
  Briefcase,
  CalendarDays,
  CreditCard,
  FolderTree,
  GalleryHorizontalEnd,
  Gift,
  ImagePlus,
  KeyRound,
  Megaphone,
  MessageSquareHeart,
  Package,
  PenLine,
  Ruler,
  Settings2,
  ShoppingBag,
  Sparkles,
  ToggleLeft,
  Truck,
  Wallet,
  Warehouse,
  type LucideIcon
} from 'lucide-react'
import { type CategoryId } from '../../types'

/**
 * Mỗi category một icon, để TÁCH khỏi `config-registry.ts` cho module đó thuần dữ liệu, không
 * dính React.
 */
const CATEGORY_ICONS: Record<string, LucideIcon> = {
  banners: GalleryHorizontalEnd,
  'product-collections': ShoppingBag,
  'signature-landing': PenLine,
  feedbacks: MessageSquareHeart,
  'promotion-popup': Megaphone,

  b2b: Briefcase,

  'payment-methods': CreditCard,
  'delivery-methods': Truck,

  'card-sizes': Ruler,
  calligraphy: PenLine,

  orders: Package,
  payment: Wallet,
  shipping: Truck,
  rewards: Gift,

  postgen: Sparkles,
  imagegen: ImagePlus,

  nhanhvn: Warehouse,
  ahamove: Bike,

  contact: Contact,
  company: Building2,
  general: Settings2,
  features: ToggleLeft,
  dates: CalendarDays,
  secrets: KeyRound
}

/** Các category `other:<group>` sinh tự động dùng chung một icon trung tính. */
export const iconForCategory = (id: CategoryId): LucideIcon => CATEGORY_ICONS[id] ?? FolderTree
