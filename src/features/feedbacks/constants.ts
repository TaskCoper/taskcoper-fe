import type { I18nKey } from '@/lib/i18n/types'

type FeedbackQuestion = {
  id: 'punctuality' | 'preparation' | 'quality' | 'communication' | 'actionability'
  titleKey: I18nKey
  labelKey: I18nKey
  options: { value: string; labelKey: I18nKey }[]
}

export const packageFeedbackQuestions: FeedbackQuestion[] = [
  {
    id: 'punctuality' as const,
    titleKey: 'packageFeedback.questions.punctuality.title',
    labelKey: 'packageFeedback.questions.punctuality.label',
    options: [
      { value: '4', labelKey: 'packageFeedback.questions.punctuality.options.4' },
      { value: '3', labelKey: 'packageFeedback.questions.punctuality.options.3' },
      { value: '2', labelKey: 'packageFeedback.questions.punctuality.options.2' },
      { value: '1', labelKey: 'packageFeedback.questions.punctuality.options.1' }
    ]
  },
  {
    id: 'preparation' as const,
    titleKey: 'packageFeedback.questions.preparation.title',
    labelKey: 'packageFeedback.questions.preparation.label',
    options: [
      { value: '4', labelKey: 'packageFeedback.questions.preparation.options.4' },
      { value: '3', labelKey: 'packageFeedback.questions.preparation.options.3' },
      { value: '2', labelKey: 'packageFeedback.questions.preparation.options.2' },
      { value: '1', labelKey: 'packageFeedback.questions.preparation.options.1' }
    ]
  },
  {
    id: 'quality' as const,
    titleKey: 'packageFeedback.questions.quality.title',
    labelKey: 'packageFeedback.questions.quality.label',
    options: [
      { value: '4', labelKey: 'packageFeedback.questions.quality.options.4' },
      { value: '3', labelKey: 'packageFeedback.questions.quality.options.3' },
      { value: '2', labelKey: 'packageFeedback.questions.quality.options.2' },
      { value: '1', labelKey: 'packageFeedback.questions.quality.options.1' }
    ]
  },
  {
    id: 'communication' as const,
    titleKey: 'packageFeedback.questions.communication.title',
    labelKey: 'packageFeedback.questions.communication.label',
    options: [
      { value: '4', labelKey: 'packageFeedback.questions.communication.options.4' },
      { value: '3', labelKey: 'packageFeedback.questions.communication.options.3' },
      { value: '2', labelKey: 'packageFeedback.questions.communication.options.2' },
      { value: '1', labelKey: 'packageFeedback.questions.communication.options.1' }
    ]
  },
  {
    id: 'actionability' as const,
    titleKey: 'packageFeedback.questions.actionability.title',
    labelKey: 'packageFeedback.questions.actionability.label',
    options: [
      { value: '4', labelKey: 'packageFeedback.questions.actionability.options.4' },
      { value: '3', labelKey: 'packageFeedback.questions.actionability.options.3' },
      { value: '2', labelKey: 'packageFeedback.questions.actionability.options.2' },
      { value: '1', labelKey: 'packageFeedback.questions.actionability.options.1' }
    ]
  }
]

export const packageFeedbackQuestionIds = packageFeedbackQuestions.map((q) => q.id)
