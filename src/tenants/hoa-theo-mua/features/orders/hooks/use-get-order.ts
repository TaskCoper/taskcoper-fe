import { useQuery } from '@tanstack/react-query'
import orderService from '../services'

export const useGetOrder = ({ id }: { id?: string }) => {
  const { data: order, isLoading: isGettingOrder } = useQuery({
    queryKey: ['order', id],
    queryFn: () => orderService.getOrder({ id }),
    enabled: !!id
  })

  return { order, isGettingOrder }
}
