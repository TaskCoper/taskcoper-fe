export type DataTableConfig = typeof dataTableConfig

export const dataTableConfig = {
  textOperators: [
    { label: 'dataTable.operator.contains', value: 'iLike' as const },
    { label: 'dataTable.operator.notContains', value: 'notILike' as const },
    { label: 'dataTable.operator.is', value: 'eq' as const },
    { label: 'dataTable.operator.isNot', value: 'ne' as const },
    { label: 'dataTable.operator.isEmpty', value: 'isEmpty' as const },
    { label: 'dataTable.operator.isNotEmpty', value: 'isNotEmpty' as const }
  ],
  numericOperators: [
    { label: 'dataTable.operator.is', value: 'eq' as const },
    { label: 'dataTable.operator.isNot', value: 'ne' as const },
    { label: 'dataTable.operator.isLessThan', value: 'lt' as const },
    { label: 'dataTable.operator.isLessThanOrEqualTo', value: 'lte' as const },
    { label: 'dataTable.operator.isGreaterThan', value: 'gt' as const },
    { label: 'dataTable.operator.isGreaterThanOrEqualTo', value: 'gte' as const },
    { label: 'dataTable.operator.isBetween', value: 'isBetween' as const },
    { label: 'dataTable.operator.isEmpty', value: 'isEmpty' as const },
    { label: 'dataTable.operator.isNotEmpty', value: 'isNotEmpty' as const }
  ],
  dateOperators: [
    { label: 'dataTable.operator.is', value: 'eq' as const },
    { label: 'dataTable.operator.isNot', value: 'ne' as const },
    { label: 'dataTable.operator.isBefore', value: 'lt' as const },
    { label: 'dataTable.operator.isAfter', value: 'gt' as const },
    { label: 'dataTable.operator.isOnOrBefore', value: 'lte' as const },
    { label: 'dataTable.operator.isOnOrAfter', value: 'gte' as const },
    { label: 'dataTable.operator.isBetween', value: 'isBetween' as const },
    { label: 'dataTable.operator.isRelativeToToday', value: 'isRelativeToToday' as const },
    { label: 'dataTable.operator.isEmpty', value: 'isEmpty' as const },
    { label: 'dataTable.operator.isNotEmpty', value: 'isNotEmpty' as const }
  ],
  selectOperators: [
    { label: 'dataTable.operator.is', value: 'eq' as const },
    { label: 'dataTable.operator.isNot', value: 'ne' as const },
    { label: 'dataTable.operator.isEmpty', value: 'isEmpty' as const },
    { label: 'dataTable.operator.isNotEmpty', value: 'isNotEmpty' as const }
  ],
  multiSelectOperators: [
    { label: 'dataTable.operator.hasAnyOf', value: 'inArray' as const },
    { label: 'dataTable.operator.hasNoneOf', value: 'notInArray' as const },
    { label: 'dataTable.operator.isEmpty', value: 'isEmpty' as const },
    { label: 'dataTable.operator.isNotEmpty', value: 'isNotEmpty' as const }
  ],
  booleanOperators: [
    { label: 'dataTable.operator.is', value: 'eq' as const },
    { label: 'dataTable.operator.isNot', value: 'ne' as const }
  ],
  sortOrders: [
    { label: 'dataTable.column.asc', value: 'asc' as const },
    { label: 'dataTable.column.desc', value: 'desc' as const }
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
