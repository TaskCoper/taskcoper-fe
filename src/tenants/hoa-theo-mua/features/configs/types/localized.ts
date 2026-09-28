/** Các kiểu nội dung cơ bản dùng chung cho mọi document config song ngữ. */

export interface LocalizedText {
  vi: string
  en: string
}

export interface CollectionSection {
  title: LocalizedText
  description: LocalizedText
  enabled: boolean
}

export interface CollectionCard {
  id: string
  image: string
  badge: LocalizedText
  name: LocalizedText
  description: LocalizedText
  categoryIds: string[]
  enabled: boolean
}
