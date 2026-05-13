export interface NewsSource {
  id: string
  name: string
  shortName: string
  logoUrl: string | null
  fallback: string
  accentClassName: string
  homepageUrl: string
}

export interface NewsCategory {
  id: string
  name: string
  slug: string
  textClassName: string
  bgClassName: string
  softBgClassName: string
}

export interface NewsArticle {
  id: string
  slug: string
  title: string
  excerpt: string
  coverUrl: string
  source: NewsSource
  category: NewsCategory
  readTimeMinutes: number
  publishedAt: string
  url: string
}
