import { useSyncExternalStore } from 'react'
import { encodeImageViewport, type ImageViewport } from './image-viewport'

/**
 * Files picked in a form but not yet sent to storage, keyed by the `blob:` URL that stands in for
 * them until the form is saved (uploading on pick would orphan objects with no cleanup path).
 *
 * Framing rides along too, since a `blob:` URL is re-minted per session and can't carry a fragment;
 * both are written into the real URL together by `resolveStagedImages`.
 */
export type StagedUpload = {
  file: File
  viewport: ImageViewport | null
}

const staged = new Map<string, StagedUpload>()
const listeners = new Set<() => void>()

const emit = () => listeners.forEach((listener) => listener())

const subscribe = (listener: () => void) => {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

/** Takes ownership of `file` and returns the `blob:` URL that stands in for it in form state. */
export const stageUpload = (file: File): string => {
  const url = URL.createObjectURL(file)
  staged.set(url, { file, viewport: null })
  emit()
  return url
}

export const getStagedUpload = (url: string | null | undefined): StagedUpload | undefined =>
  url ? staged.get(url) : undefined

export const isStagedUrl = (url: string | null | undefined): boolean => Boolean(url && staged.has(url))

export const setStagedViewport = (url: string, viewport: ImageViewport | null): void => {
  const entry = staged.get(url)
  if (!entry) return

  // A new object, so `useSyncExternalStore` sees the change.
  staged.set(url, { ...entry, viewport })
  emit()
}

/** Revokes the object URL and forgets the file. Safe to call with any string. */
export const releaseStagedUpload = (url: string | null | undefined): void => {
  if (!url || !staged.has(url)) return

  URL.revokeObjectURL(url)
  staged.delete(url)
  emit()
}

/** Subscribes to one staged entry. Returns `undefined` for any URL that is not staged. */
export const useStagedUpload = (url: string | null | undefined): StagedUpload | undefined =>
  useSyncExternalStore(
    subscribe,
    () => (url ? staged.get(url) : undefined),
    () => undefined
  )

/**
 * Outcome of resolving a payload. Tagged rather than `T | null` because a payload can legitimately
 * *be* `null` - a generic config value, for one - and a failure must not look like a valid result.
 */
export type ResolveStagedResult<T> = { ok: true; value: T } | { ok: false }

/**
 * Thrown by a mutation whose staged uploads failed, so its `onError` can stay quiet - the upload
 * itself already toasted. Lets an abort travel as a rejection (which skips `onSuccess`) instead of
 * a falsy return value that callers would have to re-check.
 */
export class StagedUploadError extends Error {
  constructor() {
    super('Staged uploads could not be resolved')
    this.name = 'StagedUploadError'
  }
}

/**
 * Replaces every staged `blob:` URL in `payload` with a real one, writing each file's framing
 * into the URL it lands at. `payload` is never mutated; call this before `JSON.stringify`ing it,
 * or the staged URLs end up buried in a string where they can't be found.
 *
 * Returns `{ ok: false }` if any upload fails (the caller should just abort). A URL appearing
 * more than once is uploaded once; consumed entries are released on success.
 */
export const resolveStagedImages = async <T>(
  payload: T,
  upload: (file: File) => Promise<string | null>
): Promise<ResolveStagedResult<T>> => {
  const resolved = new Map<string, string>()
  let failed = false

  const walk = async (value: unknown): Promise<unknown> => {
    if (failed) return value

    if (typeof value === 'string') {
      const entry = staged.get(value)
      if (!entry) return value

      const already = resolved.get(value)
      if (already) return already

      const url = await upload(entry.file)
      if (!url) {
        failed = true
        return value
      }

      const next = encodeImageViewport(url, entry.viewport)
      resolved.set(value, next)
      return next
    }

    if (Array.isArray(value)) {
      const out = []
      for (const item of value) out.push(await walk(item))
      return out
    }

    // Plain objects only. Files, Dates and class instances pass through untouched.
    if (value && typeof value === 'object' && Object.getPrototypeOf(value) === Object.prototype) {
      const out: Record<string, unknown> = {}
      for (const [key, item] of Object.entries(value)) out[key] = await walk(item)
      return out
    }

    return value
  }

  const result = (await walk(payload)) as T
  if (failed) return { ok: false }

  resolved.forEach((_, url) => releaseStagedUpload(url))
  return { ok: true, value: result }
}
