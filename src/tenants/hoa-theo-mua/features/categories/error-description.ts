const getMessageFromValue = (value: unknown): string | undefined => {
  if (!value) return undefined
  if (typeof value === 'string') return value

  if (typeof value === 'object') {
    const record = value as Record<string, unknown>

    if (typeof record.message === 'string') return record.message
    if (typeof record.detail === 'string') return record.detail
    if (typeof record.title === 'string') return record.title
  }

  return undefined
}

export const getResponseMessage = (responseData: unknown): string | undefined => {
  if (!responseData) return undefined

  const directMessage = getMessageFromValue(responseData)
  if (directMessage) return directMessage

  if (typeof responseData === 'object') {
    const record = responseData as Record<string, unknown>
    const nestedMessage = getMessageFromValue(record.detail) ?? getMessageFromValue(record.error)

    if (nestedMessage) return nestedMessage
  }

  try {
    return JSON.stringify(responseData)
  } catch {
    return undefined
  }
}

export const getErrorDescription = getResponseMessage
