import type { SubmitPackageFeedbackFormValues } from './validations'

export const calculatePackageFeedbackRating = (metadata: SubmitPackageFeedbackFormValues['metadata']) => {
  const values = Object.values(metadata).map(Number)

  if (values.length === 0) {
    return 1
  }

  const total = values.reduce((sum, value) => sum + value, 0)
  const average = total / values.length
  const normalizedRating = 1 + ((average - 1) / 3) * 4

  return Math.min(5, Math.max(1, Math.round(normalizedRating * 10) / 10))
}
