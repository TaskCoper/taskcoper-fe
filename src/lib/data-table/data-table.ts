import type { I18nKey } from '@/lib/i18n/types'

export type DataTableConfig = typeof dataTableConfig

export const dataTableConfig = {
  textOperators: [
    { label: 'dataTable.operator.contains' as I18nKey, value: 'iLike' as const },
    { label: 'dataTable.operator.notContains' as I18nKey, value: 'notILike' as const },
    { label: 'dataTable.operator.is' as I18nKey, value: 'eq' as const },
    { label: 'dataTable.operator.isNot' as I18nKey, value: 'ne' as const },
    { label: 'dataTable.operator.isEmpty' as I18nKey, value: 'isEmpty' as const },
    { label: 'dataTable.operator.isNotEmpty' as I18nKey, value: 'isNotEmpty' as const }
  ],
  numericOperators: [
    { label: 'dataTable.operator.is' as I18nKey, value: 'eq' as const },
    { label: 'dataTable.operator.isNot' as I18nKey, value: 'ne' as const },
    { label: 'dataTable.operator.isLessThan' as I18nKey, value: 'lt' as const },
    { label: 'dataTable.operator.isLessThanOrEqualTo' as I18nKey, value: 'lte' as const },
    { label: 'dataTable.operator.isGreaterThan' as I18nKey, value: 'gt' as const },
    { label: 'dataTable.operator.isGreaterThanOrEqualTo' as I18nKey, value: 'gte' as const },
    { label: 'dataTable.operator.isBetween' as I18nKey, value: 'isBetween' as const },
    { label: 'dataTable.operator.isEmpty' as I18nKey, value: 'isEmpty' as const },
    { label: 'dataTable.operator.isNotEmpty' as I18nKey, value: 'isNotEmpty' as const }
  ],
  dateOperators: [
    { label: 'dataTable.operator.is' as I18nKey, value: 'eq' as const },
    { label: 'dataTable.operator.isNot' as I18nKey, value: 'ne' as const },
    { label: 'dataTable.operator.isBefore' as I18nKey, value: 'lt' as const },
    { label: 'dataTable.operator.isAfter' as I18nKey, value: 'gt' as const },
    { label: 'dataTable.operator.isOnOrBefore' as I18nKey, value: 'lte' as const },
    { label: 'dataTable.operator.isOnOrAfter' as I18nKey, value: 'gte' as const },
    { label: 'dataTable.operator.isBetween' as I18nKey, value: 'isBetween' as const },
    { label: 'dataTable.operator.isRelativeToToday' as I18nKey, value: 'isRelativeToToday' as const },
    { label: 'dataTable.operator.isEmpty' as I18nKey, value: 'isEmpty' as const },
    { label: 'dataTable.operator.isNotEmpty' as I18nKey, value: 'isNotEmpty' as const }
  ],
  selectOperators: [
    { label: 'dataTable.operator.is' as I18nKey, value: 'eq' as const },
    { label: 'dataTable.operator.isNot' as I18nKey, value: 'ne' as const },
    { label: 'dataTable.operator.isEmpty' as I18nKey, value: 'isEmpty' as const },
    { label: 'dataTable.operator.isNotEmpty' as I18nKey, value: 'isNotEmpty' as const }
  ],
  multiSelectOperators: [
    { label: 'dataTable.operator.hasAnyOf' as I18nKey, value: 'inArray' as const },
    { label: 'dataTable.operator.hasNoneOf' as I18nKey, value: 'notInArray' as const },
    { label: 'dataTable.operator.isEmpty' as I18nKey, value: 'isEmpty' as const },
    { label: 'dataTable.operator.isNotEmpty' as I18nKey, value: 'isNotEmpty' as const }
  ],
  booleanOperators: [
    { label: 'dataTable.operator.is' as I18nKey, value: 'eq' as const },
    { label: 'dataTable.operator.isNot' as I18nKey, value: 'ne' as const }
  ],
  sortOrders: [
    { label: 'dataTable.column.asc' as I18nKey, value: 'asc' as const },
    { label: 'dataTable.column.desc' as I18nKey, value: 'desc' as const }
  ],
  filterVariants: [
    'text',
    'number',
    'range',
    'date',
    'dateRange',
    'boolean',
    'select',
    'multiSelect',
    'radio'
  ] as const,
  operators: [
    'iLike',
    'notILike',
    'eq',
    'ne',
    'inArray',
    'notInArray',
    'isEmpty',
    'isNotEmpty',
    'lt',
    'lte',
    'gt',
    'gte',
    'isBetween',
    'isRelativeToToday'
  ] as const,
  joinOperators: ['and', 'or'] as const
}
