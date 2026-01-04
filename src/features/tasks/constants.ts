export const TaskReminder = {
  NONE: 'common.ui.none',
  EXPIRED_DATE: 'task.date.expiredDate',
  FIVE_MINUTES_BEFORE: 'task.date.fiveMinutesBefore',
  TEN_MINUTES_BEFORE: 'task.date.tenMinutesBefore',
  FIFTEEN_MINUTES_BEFORE: 'task.date.fifteenMinutesBefore',
  ONE_HOUR_BEFORE: 'task.date.oneHourBefore',
  TWO_HOURS_BEFORE: 'task.date.twoHoursBefore',
  ONE_DAY_BEFORE: 'task.date.oneDayBefore',
  TWO_DAYS_BEFORE: 'task.date.twoDaysBefore'
} as const

export type TaskReminderType = (typeof TaskReminder)[keyof typeof TaskReminder]
