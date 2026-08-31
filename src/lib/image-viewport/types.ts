/**
 * The visible rectangle of a source image, as percentages (0..100) of its natural size.
 * Matches react-easy-crop's `croppedAreaPercentages` shape, so a saved framing round-trips
 * through `initialCroppedAreaPercentages` without conversion. Presentation only - the asset itself
 * is never modified.
 */
export type ImageViewport = {
  /** Schema version. An unrecognised version decodes to `null` rather than being guessed at. */
  v: 1
  x: number
  y: number
  w: number
  h: number
}
