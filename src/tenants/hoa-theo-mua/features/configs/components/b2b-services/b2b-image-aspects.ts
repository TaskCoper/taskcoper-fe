/**
 * Aspect ratios of the boxes b2b images actually render in, taken from each slot's preview
 * component rather than chosen for tidiness. A responsive slot uses its middle breakpoint's
 * ratio; slots that never crop (`object-contain`, or free width) pass `null`.
 */
export const B2B_IMAGE_ASPECT = {
  /** Splits the difference between the ~2.5 desktop backdrop and the 4:3 mobile card. */
  overviewHero: 16 / 9,
  /** Trust-bar mark: `size-10 sm:size-14` with `object-cover` (`b2b-trust-bar-section.tsx`). */
  logo: 1,
  /** Service hero: `aspect-[16/10] sm:aspect-[16/8] lg:aspect-[16/7]`. */
  serviceHero: 16 / 8,
  /** `ServiceImageDivider` default. */
  sectionDivider: 16 / 7,
  /** `ServiceImageDivider` where the section passes `ratio='aspect-[16/6]'`. */
  sectionDividerWide: 16 / 6,
  /** `ServiceImageSplit`: `aspect-[4/5] sm:aspect-[4/3]`, then text-driven from `md`. */
  sectionSplit: 4 / 3,
  /** Open Graph card. */
  openGraph: 1.91
} as const
