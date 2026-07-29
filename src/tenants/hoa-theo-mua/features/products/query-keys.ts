/**
 * Centralized React Query keys for the products feature. Co-located here (rather than the app-wide
 * `src/lib/query-keys.ts`) because these keys are tenant-scoped, but following the same factory
 * pattern so every pinned-list reader, mutation invalidation, and imperative `fetchQuery` derives an
 * identical key.
 *
 * The pinned list is keyed by `categoryId` so the two pin/position pairs never collide in cache:
 * global pins (no category) live under `null`, each category's junction pins under its own id.
 */
export const productKeys = {
  all: ['products'] as const,
  /** Prefix that matches every category-scoped pinned list — use for broad invalidation. */
  pinnedRoot: () => [...productKeys.all, 'pinned'] as const,
  pinned: (categoryId?: string | null) => [...productKeys.all, 'pinned', categoryId ?? null] as const,
  detail: (id: string | number) => [...productKeys.all, 'detail', String(id)] as const
}
