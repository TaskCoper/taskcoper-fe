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
  const { data = [], isFetching: isSearchingAddress } = useQuery({
    queryKey: ['vietmap-autocomplete', text, focus ?? null, ward ?? null, city ?? null],
    queryFn: () => vietmapService.autocompleteAddress({ text, focus, ward, city }),
    enabled: enabled && text.trim().length >= 2,
    placeholderData: keepPreviousData
  })

  // VietMap occasionally returns the same ref_id more than once in a single
  // response; dedupe so React keys and cmdk item values stay unique.
  const suggestions = Array.from(new Map(data.map((result) => [result.ref_id, result])).values())

  return { suggestions, isSearchingAddress }
}
