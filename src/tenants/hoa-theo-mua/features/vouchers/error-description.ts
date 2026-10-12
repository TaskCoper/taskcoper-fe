const getString = (value: unknown): string | undefined => (typeof value === 'string' && value ? value : undefined)

export const getErrorDescription = (responseData: unknown): string | undefined => {
  if (!responseData || typeof responseData !== 'object') return undefined

  const { detail, errors } = responseData as { detail?: unknown; errors?: unknown }

  if (Array.isArray(errors)) {
    const messages = errors.map((item) => getString((item as { message?: unknown } | null)?.message))
    const validMessages = messages.filter((message): message is string => message !== undefined)

    if (validMessages.length > 0) return validMessages.join('\n')
  } else if (errors && typeof errors === 'object') {
    const errorDetail = getString((errors as { detail?: unknown }).detail)

    if (errorDetail) return errorDetail
  }

  return getString(detail)
}
