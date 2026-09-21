import { useQuery } from '@tanstack/react-query'
import orderService from '../services'

export interface GetOrderDetailCardsParams {
  orderDetailsId: string
  virtualId: string
}

export const useGetOrderDetailCards = ({ orderDetailsId, virtualId }: Partial<GetOrderDetailCardsParams>) => {
  const {
    data: orderDetailCards,
    isLoading: isGettingOrderDetailCards,
    isError: isOrderDetailCardsError
  } = useQuery({
    queryKey: ['order-detail-cards', orderDetailsId, virtualId],
    queryFn: () => orderService.getOrderDetailCards({ orderDetailsId: orderDetailsId!, virtualId: virtualId! }),
    enabled: !!orderDetailsId && !!virtualId,
    throwOnError: false
  })

  return { orderDetailCards, isGettingOrderDetailCards, isOrderDetailCardsError }
}
