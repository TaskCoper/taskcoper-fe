import { useQuery } from '@tanstack/react-query'
import orderService from '../services'

export const useGetSystemOrder = ({ id }: { id?: string }) => {
  const { data: systemOrder, isLoading: isGettingSystemOrder } = useQuery({
    queryKey: ['orders', 'system', id],
    queryFn: () => orderService.getSystemOrder({ id }),
    enabled: !!id
  })

  return { systemOrder, isGettingSystemOrder }
}
