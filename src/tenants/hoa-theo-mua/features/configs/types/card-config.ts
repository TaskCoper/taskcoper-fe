/** Document `card_config.sizes` và `card_config.prices`. Snake_case bám theo payload của BE. */

export interface CardSize {
  name: string
  width: number
  height: number
  base_price: number
  max_words: number
}

export interface CalligraphyRule {
  min_words: number
  max_words: number
  extra_price: number
}
