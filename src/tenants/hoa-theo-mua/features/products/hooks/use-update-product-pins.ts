import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { useMutation, useMutationState, useQueryClient } from '@tanstack/react-query'
import { isAxiosError } from 'axios'
import { toast } from 'sonner'
import { MembershipUnavailableError, ensureCategoryMembership } from '../category-membership'
import { getErrorDescription } from '../error-description'
import { productKeys } from '../query-keys'
import { resolveAppendPositionFor } from '../reorder-utils'
import productService from '../services'

/** One pin/unpin change for a product in a single scope. `categoryId` absent → the global target. */
export interface PinTargetChange {
  categoryId?: string
  isPin: boolean
  /**
   * The product isn't a member of this category yet, so membership has to be created before the pin
   * can write its junction row. Only meaningful together with `categoryId` and `isPin: true`.
   */
  requiresMembership?: boolean
}

export interface UpdateProductPinsInput {
  productId: string
  changes: PinTargetChange[]
}

/**
 * Apply a batch of pin/unpin changes for one product across scopes (global + any categories). Each
 * change hits `PUT /v1/products/pin` with its own `categoryId` (or none), so one dialog can pin the
 * product to several places and unpin it from others at once. Newly-pinned targets are appended to
 * the end of their scope's list so positions stay distinct.
 */
export const useUpdateProductPins = () => {
  const queryClient = useQueryClient()
  const { t } = useTenantTranslation()

  const { mutate: updateProductPins, isPending: isUpdatingProductPins } = useMutation({
    mutationKey: productKeys.pinUpdate(),
    mutationFn: async ({ productId, changes }: UpdateProductPinsInput) => {
      // Sequential so each scope's append-position read reflects the pin that just landed.
      for (const change of changes) {
        if (change.isPin && change.categoryId && change.requiresMembership) {
          await ensureCategoryMembership(queryClient, change.categoryId, [productId])
        }

        await productService.pinProduct({ body: { productId, isPin: change.isPin, categoryId: change.categoryId } })
        if (!change.isPin) continue

        try {
          const pinned = await queryClient.fetchQuery({
            queryKey: productKeys.pinned(change.categoryId),
            queryFn: () => productService.getPinnedProducts({ categoryId: change.categoryId })
          })
          const position = resolveAppendPositionFor(pinned, productId)
          if (position !== null) {
            await productService.moveProduct({ id: productId, position, categoryId: change.categoryId })
          }
        } catch {
          // Couldn't resolve the scope's list - leave the server default; a later drag re-numbers cleanly.
        }
      }
    },
    onError: (error) => {
      if (error instanceof MembershipUnavailableError) {
        toast.error(t('products.pinned.add.membershipFailed'))
        return
      }

      toast.error(t('error.somethingWentWrong'), {
        description: isAxiosError(error) ? getErrorDescription(error.response?.data) : undefined
      })
    },
    onSettled: (_data, _error, { productId, changes }) => {
      // Scoped rather than `productKeys.all` (a prefix of every catalog page): refetch only the pinned
      // lists this batch actually touched, the product's own detail, and the catalog pages.
      changes.forEach((change) => queryClient.invalidateQueries({ queryKey: productKeys.pinned(change.categoryId) }))
      queryClient.invalidateQueries({ queryKey: productKeys.detail(productId) })
      queryClient.invalidateQueries({ queryKey: productKeys.lists() })
      queryClient.invalidateQueries({ queryKey: productKeys.listsInfinite() })

      if (changes.some((change) => change.requiresMembership)) {
        queryClient.invalidateQueries({ queryKey: ['categoryProducts'] })
      }
    }
  })

  return { updateProductPins, isUpdatingProductPins }
}

/**
 * The product whose pin batch is currently in flight, or `null`.
 *
 * Read from the mutation cache rather than the hook's own `variables` because the trigger and the
 * writer live in different components - the catalog row renders the spinner, while the dialog owns
 * the mutation.
 */
export const useUpdatingProductPinId = (): string | null => {
  const pending = useMutationState({
    filters: { mutationKey: productKeys.pinUpdate(), status: 'pending' },
    select: (mutation) => (mutation.state.variables as UpdateProductPinsInput | undefined)?.productId ?? null
  })

  return pending.find((productId): productId is string => productId != null) ?? null
}
