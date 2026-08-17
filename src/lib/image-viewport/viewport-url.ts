import type { ImageViewport } from './types'

// No runtime imports here (or in viewport-layout.ts) — lets verify-image-viewport.mjs load this under Node's type stripping.

export const IMAGE_VIEWPORT_VERSION = 1

/** Fragment token key. The full token reads `iv=1,x,y,w,h`. */
export const IMAGE_VIEWPORT_FRAGMENT_KEY = 'iv'

/** Decimals kept when serializing. 0.01% of a 4000px image is 0.4px. */
export const IMAGE_VIEWPORT_PRECISION = 2

/** The whole image. Never serialized — `encodeImageViewport` drops it. */
export const FULL_FRAME_VIEWPORT: ImageViewport = { v: IMAGE_VIEWPORT_VERSION, x: 0, y: 0, w: 100, h: 100 }

const TOKEN_SEPARATOR = '&'
const VALUE_SEPARATOR = ','

/** Half a representable step, so comparisons agree with what serialization can express. */
const EPSILON = 10 ** -IMAGE_VIEWPORT_PRECISION / 2

const round = (value: number): number => Number(value.toFixed(IMAGE_VIEWPORT_PRECISION))

// Object URLs are re-minted per session, so a framing pinned to one would be meaningless later;
// callers hold the viewport in state instead and commit it to a URL once uploaded.
const isTransientUrl = (url: string): boolean => url.startsWith('blob:') || url.startsWith('data:')

/**
 * Brings a candidate into range and guarantees `x + w <= 100` and `y + h <= 100`.
 *
 * Returns `null` for anything unusable — missing fields, `NaN`, or a degenerate rect — so every
 * caller has exactly one failure mode to handle. react-easy-crop emits float noise such as
 * `-0.0000001` or `100.0000001`, so this runs on its output too.
 */
export const clampImageViewport = (input: Partial<ImageViewport> | null | undefined): ImageViewport | null => {
  if (!input) return null

  const { x, y, w, h } = input
  if (![x, y, w, h].every((value) => typeof value === 'number' && Number.isFinite(value))) return null

  // Round before clamping so the invariant holds for the values actually serialized, not pre-rounding intermediates.
  const nextX = Math.min(Math.max(round(x as number), 0), 100)
  const nextY = Math.min(Math.max(round(y as number), 0), 100)
  const nextW = round(Math.min(Math.max(round(w as number), 0), 100 - nextX))
  const nextH = round(Math.min(Math.max(round(h as number), 0), 100 - nextY))

  // A zero-area rect cannot be rendered and would divide by zero in the layout math.
  if (nextW <= 0 || nextH <= 0) return null

  return { v: IMAGE_VIEWPORT_VERSION, x: nextX, y: nextY, w: nextW, h: nextH }
}

/** True when the viewport shows the whole image. `null` counts as full frame. */
export const isFullFrameViewport = (viewport: ImageViewport | null | undefined): boolean => {
  if (!viewport) return true

  return (
    Math.abs(viewport.x) < EPSILON &&
    Math.abs(viewport.y) < EPSILON &&
    Math.abs(viewport.w - 100) < EPSILON &&
    Math.abs(viewport.h - 100) < EPSILON
  )
}

const parseToken = (raw: string): ImageViewport | null => {
  const parts = raw.split(VALUE_SEPARATOR)
  if (parts.length !== 5) return null

  // An unrecognised version is not reinterpreted under the current schema.
  if (Number(parts[0]) !== IMAGE_VIEWPORT_VERSION) return null

  const [x, y, w, h] = parts.slice(1).map(Number)
  return clampImageViewport({ x, y, w, h })
}

/**
 * Splits a stored image value into the URL to render and the framing to apply. Never throws;
 * legacy or malformed fragments yield `viewport: null`, and unrelated fragment tokens are preserved.
 *
 * Hand-parsed rather than `new URL()`, which throws on `''` — the default value of every image field here.
 */
export const decodeImageViewport = (
  url: string | null | undefined
): { src: string; viewport: ImageViewport | null } => {
  if (!url) return { src: '', viewport: null }
  if (isTransientUrl(url)) return { src: url, viewport: null }

  const hashIndex = url.indexOf('#')
  if (hashIndex === -1) return { src: url, viewport: null }

  const base = url.slice(0, hashIndex)
  const prefix = `${IMAGE_VIEWPORT_FRAGMENT_KEY}=`

  const foreignTokens: string[] = []
  let viewport: ImageViewport | null = null

  for (const token of url.slice(hashIndex + 1).split(TOKEN_SEPARATOR)) {
    if (!token.startsWith(prefix)) {
      if (token) foreignTokens.push(token)
      continue
    }

    // Last one wins, matching how repeated query-string keys are conventionally read.
    viewport = parseToken(token.slice(prefix.length))
  }

  const fragment = foreignTokens.join(TOKEN_SEPARATOR)
  return { src: fragment ? `${base}#${fragment}` : base, viewport }
}

/**
 * Writes a framing into a stored image value, returning the string to persist. Idempotent — any
 * existing framing is stripped first. Returns the bare URL when the viewport is absent, unusable,
 * or full-frame, so legacy and reset values look identical.
 *
 * Transient `blob:` / `data:` URLs are returned untouched.
 */
export const encodeImageViewport = (url: string, viewport: ImageViewport | null | undefined): string => {
  if (!url || isTransientUrl(url)) return url

  const { src } = decodeImageViewport(url)
  const clamped = clampImageViewport(viewport)
  if (isFullFrameViewport(clamped)) return src

  const { v, x, y, w, h } = clamped as ImageViewport
  const token = `${IMAGE_VIEWPORT_FRAGMENT_KEY}=${v}${VALUE_SEPARATOR}${x}${VALUE_SEPARATOR}${y}${VALUE_SEPARATOR}${w}${VALUE_SEPARATOR}${h}`

  return src.includes('#') ? `${src}${TOKEN_SEPARATOR}${token}` : `${src}#${token}`
}
