import type { QueryClient } from '@tanstack/react-query'
import categoryService from '../categories/services'

export class MembershipUnavailableError extends Error {
  constructor() {
    super('CategoryMembershipUnavailable')
    this.name = 'MembershipUnavailableError'
  }
}

// bulk assign missing products to category
export async function ensureCategoryMembership(
  queryClient: QueryClient,
  categoryId: string,
  productIds: string[]
): Promise<void> {
  if (productIds.length === 0) return

  const category = await queryClient.fetchQuery({
    queryKey: ['categoryProduct', categoryId],
    queryFn: () => categoryService.getCategory({ id: categoryId })
  })

  if (!category?.productIds) throw new MembershipUnavailableError()

  const missing = productIds.filter((productId) => !category.productIds!.includes(productId))
  if (missing.length === 0) return

  await categoryService.assignProducts({
    id: categoryId,
    body: { productIds: [...category.productIds, ...missing] }
  })
}
