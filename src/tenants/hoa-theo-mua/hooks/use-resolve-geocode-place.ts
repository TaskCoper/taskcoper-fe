import { useMutation } from '@tanstack/react-query'
import vietmapService from '../services/vietmap.service'

export const useResolveGeocodePlace = () => {
  const { mutateAsync: resolveGeocodePlace, isPending: isResolvingGeocodePlace } = useMutation({
    mutationFn: ({ refId }: { refId: string }) => vietmapService.getPlaceDetail({ refId })
  })

  return { resolveGeocodePlace, isResolvingGeocodePlace }
}
