import { keepPreviousData, useQuery } from '@tanstack/react-query'
import vietmapService from '../services/vietmap.service'

export const useAddressAutocomplete = ({
  text,
  focus,
  ward,
  city,
  enabled = true
}: {
  text: string
  focus?: string
  ward?: string
  city?: string
  enabled?: boolean
}) => {
  const { data: suggestions = [], isFetching: isSearchingAddress } = useQuery({
    queryKey: ['vietmap-autocomplete', text, focus ?? null, ward ?? null, city ?? null],
    queryFn: () => vietmapService.autocompleteAddress({ text, focus, ward, city }),
    enabled: enabled && text.trim().length >= 2,
    placeholderData: keepPreviousData
  })

  return { suggestions, isSearchingAddress }
}
