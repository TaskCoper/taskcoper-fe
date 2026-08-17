/**
 * Deterministic verification for the image-viewport core (this repo has no test runner).
 *
 *   node scripts/verify-image-viewport.mjs
 *
 * Loads `viewport-layout.ts` / `viewport-url.ts` directly under Node's type stripping, so those
 * modules must stay free of runtime imports.
 */
import { resolveViewportLayout } from '../src/lib/image-viewport/viewport-layout.ts'
import {
  clampImageViewport,
  decodeImageViewport,
  encodeImageViewport,
  isFullFrameViewport
} from '../src/lib/image-viewport/viewport-url.ts'

const TOLERANCE = 1e-6

let failures = 0
let assertions = 0

const fail = (label, detail) => {
  failures += 1
  console.error(`  ✗ ${label}\n      ${detail}`)
}

const ok = (condition, label, detail) => {
  assertions += 1
  if (!condition) fail(label, detail)
}

const near = (actual, expected, label) =>
  ok(
    Math.abs(actual - expected) <= TOLERANCE * Math.max(1, Math.abs(expected)),
    label,
    `expected ${expected}, got ${actual}`
  )

const equal = (actual, expected, label) =>
  ok(
    JSON.stringify(actual) === JSON.stringify(expected),
    label,
    `expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`
  )

// ---------------------------------------------------------------------------
// Layout matrix
// ---------------------------------------------------------------------------

/** Asserts every guarantee the renderer relies on, for one source/container/region combination. */
const checkLayout = ({ label, naturalAspect, containerAspect, viewport }) => {
  const naturalHeight = 1000
  const naturalWidth = naturalHeight * naturalAspect
  const containerHeight = 400
  const containerWidth = containerHeight * containerAspect

  const layout = resolveViewportLayout({ viewport, containerWidth, containerHeight, naturalWidth, naturalHeight })

  if (!layout) {
    fail(label, 'resolveViewportLayout returned null for a valid input')
    return
  }

  const { left, top, width, height } = layout

  // (a) No distortion — the rendered box keeps the source's intrinsic aspect.
  near(width / height, naturalAspect, `${label} · uniform scale`)

  // (b) Full cover — the image never pulls away from an edge.
  ok(width >= containerWidth - TOLERANCE, `${label} · covers width`, `${width} < ${containerWidth}`)
  ok(height >= containerHeight - TOLERANCE, `${label} · covers height`, `${height} < ${containerHeight}`)

  // (c) Containment — no gap on any side.
  ok(left <= TOLERANCE, `${label} · left edge`, `left=${left} must be <= 0`)
  ok(top <= TOLERANCE, `${label} · top edge`, `top=${top} must be <= 0`)
  ok(left + width >= containerWidth - TOLERANCE, `${label} · right edge`, `${left + width} < ${containerWidth}`)
  ok(top + height >= containerHeight - TOLERANCE, `${label} · bottom edge`, `${top + height} < ${containerHeight}`)

  // (d) The selected region covers the container: cover semantics applied to the region, not the whole image.
  const regionWidth = (viewport.w / 100) * width
  const regionHeight = (viewport.h / 100) * height
  const touchesWidth = Math.abs(regionWidth - containerWidth) <= TOLERANCE * containerWidth
  const touchesHeight = Math.abs(regionHeight - containerHeight) <= TOLERANCE * containerHeight

  ok(
    touchesWidth || touchesHeight,
    `${label} · region touches a container axis`,
    `region ${regionWidth}x${regionHeight} touches neither axis of ${containerWidth}x${containerHeight}`
  )
  ok(
    regionWidth >= containerWidth - TOLERANCE * containerWidth &&
      regionHeight >= containerHeight - TOLERANCE * containerHeight,
    `${label} · region covers container`,
    `region ${regionWidth}x${regionHeight} smaller than container ${containerWidth}x${containerHeight}`
  )

  // (e) Exactness — when the container matches the region's aspect, it maps onto it precisely.
  // Tolerance is 1e-3 (looser than TOLERANCE) since a stored viewport is rounded to IMAGE_VIEWPORT_PRECISION decimals.
  const regionAspect = (viewport.w / viewport.h) * naturalAspect
  if (Math.abs(containerAspect - regionAspect) <= 1e-3 * regionAspect) {
    // Scaled by container dimension, not `expected`: offsets compare against 0, where a relative tolerance would collapse.
    const exact = (actual, expected, scale, name) =>
      ok(Math.abs(actual - expected) <= 1e-3 * scale, name, `expected ${expected}, got ${actual}`)

    exact(regionWidth, containerWidth, containerWidth, `${label} · exact width`)
    exact(regionHeight, containerHeight, containerHeight, `${label} · exact height`)
    exact(left + (viewport.x / 100) * width, 0, containerWidth, `${label} · exact left`)
    exact(top + (viewport.y / 100) * height, 0, containerHeight, `${label} · exact top`)
  }
}

/** The region an editor gets when it crops at `aspect`, centred, at `scale` of the max fit. */
const regionFor = (naturalAspect, aspect, scale = 1, offset = 0) => {
  // Largest rect of `aspect` that fits the source, then shrunk by `scale` (i.e. zoomed in).
  const fitsWidth = naturalAspect <= aspect
  const w = (fitsWidth ? 100 : (aspect / naturalAspect) * 100) * scale
  const h = (fitsWidth ? (naturalAspect / aspect) * 100 : 100) * scale

  return clampImageViewport({ x: (100 - w) / 2 + offset, y: (100 - h) / 2 + offset, w, h })
}

console.log('resolveViewportLayout')

const LAYOUT_CASES = [
  { label: '16:9 → 16:9', naturalAspect: 16 / 9, containerAspect: 16 / 9 },
  { label: '16:9 → 16:7  (b2b sectionDivider)', naturalAspect: 16 / 9, containerAspect: 16 / 7 },
  { label: '16:9 → 4:5   (b2b sectionSplit)', naturalAspect: 16 / 9, containerAspect: 4 / 5 },
  { label: '4:3  → 1:1   (trust-bar logo)', naturalAspect: 4 / 3, containerAspect: 1 },
  { label: '3:4  → 16:9  (portrait → landscape)', naturalAspect: 3 / 4, containerAspect: 16 / 9 },
  { label: '16:9 → 32:9  (very wide container)', naturalAspect: 16 / 9, containerAspect: 32 / 9 }
]

for (const { label, naturalAspect, containerAspect } of LAYOUT_CASES) {
  // Framed to the container's own aspect — the exactness path.
  checkLayout({
    label: `${label} · matched`,
    naturalAspect,
    containerAspect,
    viewport: regionFor(naturalAspect, containerAspect)
  })

  // Framed at a different aspect than it renders into — the graceful-degradation path.
  checkLayout({ label: `${label} · mismatched`, naturalAspect, containerAspect, viewport: regionFor(naturalAspect, 1) })

  // Zoomed in and pushed off-centre, which is what dragging in the editor produces.
  checkLayout({
    label: `${label} · zoomed`,
    naturalAspect,
    containerAspect,
    viewport: regionFor(naturalAspect, containerAspect, 0.45, 12)
  })

  // A full-frame viewport must behave exactly like plain object-cover.
  checkLayout({
    label: `${label} · full frame`,
    naturalAspect,
    containerAspect,
    viewport: { v: 1, x: 0, y: 0, w: 100, h: 100 }
  })
}

// Full frame must equal what `object-fit: cover` produces, so legacy images are unaffected.
for (const { label, naturalAspect, containerAspect } of LAYOUT_CASES) {
  const naturalHeight = 1000
  const naturalWidth = naturalHeight * naturalAspect
  const containerHeight = 400
  const containerWidth = containerHeight * containerAspect

  const layout = resolveViewportLayout({
    viewport: { v: 1, x: 0, y: 0, w: 100, h: 100 },
    containerWidth,
    containerHeight,
    naturalWidth,
    naturalHeight
  })

  const coverScale = Math.max(containerWidth / naturalWidth, containerHeight / naturalHeight)
  near(layout.width, naturalWidth * coverScale, `${label} · full frame matches object-cover width`)
  near(layout.height, naturalHeight * coverScale, `${label} · full frame matches object-cover height`)
  near(layout.left, (containerWidth - naturalWidth * coverScale) / 2, `${label} · full frame centred x`)
  near(layout.top, (containerHeight - naturalHeight * coverScale) / 2, `${label} · full frame centred y`)
}

// Degenerate inputs fall back rather than producing Infinity or NaN.
const DEGENERATE = [
  ['zero region width', { v: 1, x: 0, y: 0, w: 0, h: 100 }, 800, 400, 1600, 900],
  ['zero region height', { v: 1, x: 0, y: 0, w: 100, h: 0 }, 800, 400, 1600, 900],
  ['unmeasured container width', { v: 1, x: 0, y: 0, w: 50, h: 50 }, 0, 400, 1600, 900],
  ['unmeasured container height', { v: 1, x: 0, y: 0, w: 50, h: 50 }, 800, 0, 1600, 900],
  ['unloaded image', { v: 1, x: 0, y: 0, w: 50, h: 50 }, 800, 400, 0, 0],
  ['NaN region', { v: 1, x: 0, y: 0, w: NaN, h: 50 }, 800, 400, 1600, 900]
]

for (const [label, viewport, containerWidth, containerHeight, naturalWidth, naturalHeight] of DEGENERATE) {
  equal(
    resolveViewportLayout({ viewport, containerWidth, containerHeight, naturalWidth, naturalHeight }),
    null,
    `degenerate · ${label} → null`
  )
}

// ---------------------------------------------------------------------------
// Serialization
// ---------------------------------------------------------------------------

console.log('encodeImageViewport / decodeImageViewport')

const BASE = 'https://taskcoper.hcm.ss.bfcplatform.vn/general/a1b2c3-hero.jpg'
const VIEWPORT = { v: 1, x: 12.34, y: 56.78, w: 10, h: 20 }

const encoded = encodeImageViewport(BASE, VIEWPORT)
equal(encoded, `${BASE}#iv=1,12.34,56.78,10,20`, 'encode · fragment grammar')
equal(decodeImageViewport(encoded), { src: BASE, viewport: VIEWPORT }, 'decode · round trip')
equal(encodeImageViewport(encoded, VIEWPORT), encoded, 'encode · idempotent')
equal(
  encodeImageViewport(encoded, { v: 1, x: 1, y: 2, w: 3, h: 4 }),
  `${BASE}#iv=1,1,2,3,4`,
  'encode · replaces rather than stacks'
)

// A full-frame or absent viewport is spelled as the bare URL, so reset and legacy agree.
equal(encodeImageViewport(BASE, null), BASE, 'encode · null → bare url')
equal(encodeImageViewport(encoded, null), BASE, 'encode · null strips existing token')
equal(encodeImageViewport(BASE, { v: 1, x: 0, y: 0, w: 100, h: 100 }), BASE, 'encode · full frame → bare url')
ok(isFullFrameViewport(null), 'isFullFrameViewport · null is full frame', 'expected true')

// Transient URLs never carry a fragment; staged framing lives in component state instead.
equal(
  encodeImageViewport('blob:http://localhost:3000/abc', VIEWPORT),
  'blob:http://localhost:3000/abc',
  'encode · blob untouched'
)
equal(
  encodeImageViewport('data:image/png;base64,AAAA', VIEWPORT),
  'data:image/png;base64,AAAA',
  'encode · data untouched'
)
equal(encodeImageViewport('', VIEWPORT), '', 'encode · empty untouched')

// Legacy and malformed values decode to `null`, which renders as plain object-cover.
const LEGACY = [
  ['no fragment', BASE],
  ['empty string', ''],
  ['relative path', '/images/placeholder.jpg'],
  ['blob url', 'blob:http://localhost:3000/abc'],
  ['too few parts', `${BASE}#iv=1,1,2,3`],
  ['too many parts', `${BASE}#iv=1,1,2,3,4,5`],
  ['unknown version', `${BASE}#iv=2,1,2,3,4`],
  ['non-numeric', `${BASE}#iv=1,abc,2,3,4`],
  ['zero area', `${BASE}#iv=1,0,0,0,50`],
  ['unrelated fragment', `${BASE}#section-2`]
]

for (const [label, url] of LEGACY) {
  equal(decodeImageViewport(url).viewport, null, `decode · ${label} → null viewport`)
}

// Out-of-range values are clamped rather than rejected, so a bad write cannot break rendering.
equal(
  decodeImageViewport(`${BASE}#iv=1,-5,-5,200,200`).viewport,
  { v: 1, x: 0, y: 0, w: 100, h: 100 },
  'decode · clamps out-of-range'
)
equal(
  decodeImageViewport(`${BASE}#iv=1,90,90,50,50`).viewport,
  { v: 1, x: 90, y: 90, w: 10, h: 10 },
  'decode · clamps overflow'
)

// `src` must always be renderable, and a fragment we do not own must survive a round trip.
equal(decodeImageViewport(`${BASE}#iv=1,10,10,50,50`).src, BASE, 'decode · strips our token from src')
equal(decodeImageViewport(`${BASE}#section-2`).src, `${BASE}#section-2`, 'decode · keeps foreign fragment')
equal(
  decodeImageViewport(`${BASE}#section-2&iv=1,10,10,50,50`).src,
  `${BASE}#section-2`,
  'decode · keeps foreign token alongside ours'
)
equal(
  encodeImageViewport(`${BASE}#section-2`, VIEWPORT),
  `${BASE}#section-2&iv=1,12.34,56.78,10,20`,
  'encode · appends to foreign fragment'
)

// Clamping rejects everything the layout math cannot use.
for (const [label, input] of [
  ['null', null],
  ['undefined', undefined],
  ['missing fields', { x: 1, y: 2 }],
  ['NaN', { x: NaN, y: 0, w: 50, h: 50 }],
  ['Infinity', { x: 0, y: 0, w: Infinity, h: 50 }],
  ['zero width', { x: 0, y: 0, w: 0, h: 50 }],
  ['origin at the far edge', { x: 100, y: 0, w: 50, h: 50 }]
]) {
  equal(clampImageViewport(input), null, `clamp · ${label} → null`)
}

// ---------------------------------------------------------------------------

console.log('')
if (failures > 0) {
  console.error(`${failures} of ${assertions} assertions failed`)
  process.exit(1)
}
console.log(`✅ ${assertions} assertions passed`)
